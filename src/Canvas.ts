/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2013-2023 - https://www.igorski.nl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import type { Size, Point, BoundingBox, Viewport, ImageSource } from "./definitions/types";
import { IRenderer } from "./rendering/IRenderer";
import RenderAPI from "./rendering/RenderAPI";
import EventHandler from "./utils/EventHandler";
import { toggleFullScreen, transformPointer } from "./utils/Fullscreen";
import { constrainAspectRatio } from "./utils/ImageMath";
import Collision from "./Collision";
import DisplayObject from "./DisplayObject";
import type Sprite from "./Sprite";

const { min, max } = Math;

/**
 * In most instances the expected framerate is 60 fps which we consider IDEAL_FPS
 * Newer devices such as Apple M1 on Chrome manage a refresh rate of 120 fps
 * This constant is used to balance performance across different hardware / browsers
 *
 * When the actual frame rate exceeds the number defined in HIGH_REFRESH_THROTTLE
 * we consider the rendering environment to be of a high refresh rate, and cap
 * the speed to 60 fps (unless a framerate higher than IDEAL_FPS was configured)
 */
const IDEAL_FPS = 60;
const HIGH_REFRESH_THROTTLE = IDEAL_FPS + 3;

interface CanvasProps {
    width?: number;
    height?: number;
    fps?: number;
    scale?: number;
    backgroundColor?: string;
    animate?: boolean;
    smoothing?: boolean;
    stretchToFit?: boolean;
    autoSize?: boolean;
    viewport?: Size;
    viewportHandler?: ({}: { type: "panned", value: Viewport }) => void;
    preventEventBubbling?: boolean;
    optimize?: "auto" | "worker" | "none";
    parentElement?: HTMLElement;
    onUpdate?: ( now: DOMHighResTimeStamp, framesSinceLastRender: number ) => void;
    onResize?: ( width: number, height: number ) => void;
    debug?: boolean;
}

/**
 * creates an API for an HTMLCanvasElement where all drawables are treated as
 * self-contained Objects that can add/remove themselves from the DisplayList, rather
 * than having a single function aggregating all drawing instructions
 */
export default class Canvas extends DisplayObject<Canvas> {
    public DEBUG = false;
    public benchmark = {
        minElapsed: Infinity,
        maxElapsed: -Infinity,
        minFps: Infinity,
        maxFps: -Infinity,
    };
    public collision: Collision;
    public bbox: BoundingBox = { left: 0, top: 0, right: 0, bottom: 0 }; // relative to Sprites, not DOM!

    protected _element: HTMLCanvasElement;
    protected _renderer: RenderAPI;
    protected _viewport: Viewport | undefined;
    protected _smoothing = false;
    protected _stretchToFit = false;
    protected _pxr = 1;

    protected _renderHandler: ( now: DOMHighResTimeStamp ) => void;
    protected _updateHandler?: ( now: DOMHighResTimeStamp, framesSinceLastRender: number ) => void;
    protected _resizeHandler?: ( width: number, height: number ) => void;
    protected _viewportHandler?: ({}: { type: "panned", value: Viewport }) => void;
    protected _eventHandler: EventHandler;
    protected _preventDefaults = false;
  
    protected _lastRender = 0;
    protected _renderId = 0;
    protected _renderPending = false;
  
    protected _disposed = false;
    protected _scale: Point = { x: 1, y: 1 };
    protected _activeTouches: Sprite[] = [];
    protected _coords: DOMRect | undefined;
    protected _width: number;
    protected _height: number;
    protected _enqueuedSize: Size | undefined;
    protected _preferredWidth: number;
    protected _preferredHeight: number;

    protected _animate = false;
    protected _lastRaf: DOMHighResTimeStamp;
    protected _fps: number; // intended framerate
    protected _aFps: number; // actual framerate (calculated at runtime)
    protected _renderInterval: number;
    protected _bgColor: string | undefined;

    protected _hasFsHandler = false;
    protected _isFullScreen = false;

    constructor({
        width = 300,
        height = 300,
        fps = IDEAL_FPS,
        backgroundColor = null,
        animate = false,
        smoothing = true,
        stretchToFit = false,
        autoSize = true,
        viewport = null,
        preventEventBubbling = false,
        parentElement = null,
        debug = false,
        optimize = "auto",
        viewportHandler,
        onUpdate,
        onResize,
    }: CanvasProps = {}) {
        super();

        if ( width <= 0 || height <= 0 ) {
            throw new Error( "cannot construct a zCanvas without valid dimensions" );
        }

        this.DEBUG = debug;

        const { userAgent } = navigator;
        // TODO: maybe only do Worker for Chrome only?
        const isSafari = userAgent.includes( "Safari" ) && !userAgent.includes( "Chrome" );
        
        const useWorker = [ "auto", "worker" ].includes( optimize ) && !isSafari;

        this._element  = document.createElement( "canvas" );
        this._renderer = new RenderAPI( this._element, useWorker, debug );
        this.collision = new Collision( this._renderer );

        this._updateHandler   = onUpdate;
        this._renderHandler   = this.render.bind( this );
        this._viewportHandler = viewportHandler;
        this._resizeHandler   = onResize;

        this.setFrameRate( fps );
        this.setAnimatable( animate );

        if ( backgroundColor ) {
            this.setBackgroundColor( backgroundColor );
        }

        // ensure all is crisp clear on HDPI screens

        this._pxr = window.devicePixelRatio || 1;
        this._renderer.setPixelRatio( this._pxr );

        this.setDimensions( width, height, true, true );
        if ( viewport ) {
            this.setViewport( viewport.width, viewport.height );
        }
        this._stretchToFit = stretchToFit;

        this.setSmoothing( smoothing );
        this.preventEventBubbling( preventEventBubbling );
        this.addListeners( autoSize );

        if ( parentElement instanceof HTMLElement ) {
            this.insertInPage( parentElement );
        }
        requestAnimationFrame(() => this.handleResize()); // calculates appropriate scale
    }

    /* public methods */

    loadResource( id: string, source: ImageSource ): Promise<Size> {
        return this._renderer.loadResource( id, source );
    }

    getResource( id: string ): Promise<ImageBitmap | undefined> {
        return this._renderer.getResource( id );
    }

    disposeResource( id: string ): void {
        return this._renderer.disposeResource( id );
    }

    getRenderer(): IRenderer {
        return this._renderer;
    }

    /**
     * appends this Canvas to the DOM (i.e. adds the references <canvas>-
     * element into the supplied container
     *
     * @param {HTMLElement} container DOM node to append the Canvas to
     */
    insertInPage( container: HTMLElement ): void {
        if ( this._element.parentNode ) {
            throw new Error( "Canvas already present in DOM" );
        }
        container.appendChild( this._element );
    }

    /**
     * get the <canvas>-element inside the DOM that is used
     * to render this Canvas' contents
     */
    getElement(): HTMLCanvasElement {
        return this._element;
    }

    /**
     * whether or not all events captured by the Canvas can
     * bubble down in the document, when true, DOM events that
     * have interacted with the Canvas will stop their propagation
     * and prevent their default behaviour
     */
    preventEventBubbling( value: boolean ): void {
        this._preventDefaults = value;
    }

    override addChild( child: Sprite ): DisplayObject<Canvas> {
        child.setCanvas( this );
        return super.addChild( child );
    }

    /**
     * invoke when the state of the Canvas has changed (i.e.
     * the visual contents should change), this will invoke
     * a new render request
     *
     * render requests are only executed when the UI is ready
     * to render (on animationFrame), as such this method can be invoked
     * repeatedly between render cycles without actually triggering
     * multiple render executions (a single one will suffice)
     */
    override invalidate(): void {
        if ( !this._animate && !this._renderPending ) {
            this._renderPending = true;
            this._renderId = window.requestAnimationFrame( this._renderHandler );
        }
    }

    /**
     * return the framerate of the Canvas, can be queried by
     * child sprites to calculate strictly timed animated operations
     */
    getFrameRate(): number {
        return this._fps;
    }

    setFrameRate( value: number ): void {
        this._fps = value;
        this._aFps = value;
        this._renderInterval = 1000 / value;
    }

    /**
     * Returns the actual framerate achieved by the zCanvas renderer
     */
    getActualFrameRate(): number {
        return this._aFps;
    }

    /**
     * retrieve the render interval for this Canvas, this basically
     * describes the elapsed time in milliseconds between each successive
     * render at the current framerate
     */
    getRenderInterval(): number {
        return this._renderInterval;
    }

    getSmoothing(): boolean {
        return this._smoothing;
    }

    /**
     * toggle the smoothing of the Canvas' contents.
     * for pixel art-type graphics, setting the smoothing to
     * false will yield crisper results
     */
    setSmoothing( enabled: boolean ): void {
        // 1. update context
        this._renderer.setSmoothing( enabled );
        // 2. update Canvas Element in DOM
        if ( enabled ) {
            // @ts-expect-error TS7015: Element implicitly has an 'any' type because index expression is not of type 'number'.
            this._element.style[ "image-rendering" ] = "";
        } else {
            [ "-moz-crisp-edges", "-webkit-crisp-edges", "pixelated", "crisp-edges" ]
            .forEach( style => {
                // @ts-expect-error TS7015: Element implicitly has an 'any' type because index expression is not of type 'number'.
                this._element.style[ "image-rendering" ] = style;
            });
        }
        this._smoothing = enabled;
        this.invalidate();
    }

    getWidth(): number {
        return ( this._enqueuedSize ) ? this._enqueuedSize.width : this._width;
    }

    getHeight(): number {
        return ( this._enqueuedSize ) ? this._enqueuedSize.height : this._height;
    }

    /**
     * updates the dimensions of the Canvas (this actually enqueues the update and will only
     * execute it once the canvas draws to prevent flickering on constants resize operations
     * as browsers will clear the existing Canvas content when adjusting its dimensions)
     *
     * @param {number} width
     * @param {number} height
     * @param {boolean=} setAsPreferredDimensions optional, defaults to true, stretchToFit handler
     *        overrides this to ensure returning to correct dimensions when disabling stretchToFit
     * @param {boolean=} immediate optional, whether to apply immediately, defaults to false
     *        to prevent flickering of existing screen contents during repeated resize
     */
    setDimensions( width: number, height: number, setAsPreferredDimensions = true, immediate = false ): void {
        this._enqueuedSize = { width, height };

        if ( setAsPreferredDimensions ) {
            this._preferredWidth  = width;
            this._preferredHeight = height;
        }

        if ( immediate ) {
            this.updateCanvasSize();
        }
        this.invalidate();
    }

    getViewport(): Viewport | undefined {
        return this._viewport;
    }

    /**
     * In case the Canvas isn't fully visible (for instance because it is part
     * of a scrollable container), you can define the visible bounds (relative to
     * the full Canvas width/height) here. This can be used to improve rendering
     * performance on large Canvas instances by only rendering the visible area.
     */
    setViewport( width: number, height: number ): void {
        if ( !this._viewport ) {
            this._viewport = { width, height, left: 0, top: 0, right: width, bottom: height };
        }
        const vp = this._viewport;

        vp.width  = width;
        vp.height = height;

        this.panViewport( Math.min( vp.left, width ), Math.min( vp.top, height ));
    }

    /**
     * Updates the horizontal and vertical position of the viewport.
     *
     * @param {number} x
     * @param {number} y
     * @param {boolean=} broadcast optionally broadcast change to registered handler
     */
    panViewport( x: number, y: number, broadcast = false ): void {
        const vp  = this._viewport;

        vp.left   = max( 0, min( x, this._width - vp.width ));
        vp.right  = vp.left + vp.width;
        vp.top    = max( 0, min( y, this._height - vp.height ));
        vp.bottom = vp.top + vp.height;

        this.invalidate();

        if ( broadcast ) {
            this._viewportHandler?.({ type: "panned", value: vp });
        }
    }

    /**
     * set the background color for the Canvas, either hexadecimal
     * or RGB/RGBA, e.g. "#FF0000" or "rgba(255,0,0,1)";
     */
    setBackgroundColor( color: string ): void {
        this._bgColor = color;
    }

    setAnimatable( value: boolean ): void {
        this._lastRaf = window.performance.now();

        if ( value && !this._renderPending ) {
            this.invalidate();
        }
        this._animate = value;
    }

    isAnimatable(): boolean {
        return this._animate;
    }

    /**
     * Scales the canvas Element. This can be used to render content at a lower
     * resolution but scale it up to fit the screen (for instance when rendering pixel art
     * with smoothing disabled for crisp definition).
     *
     * @param {number} x the factor to scale the horizontal axis by
     * @param {number=} y the factor to scale the vertical axis by, defaults to x
     */
    scale( x: number, y = x ): void {
        this._scale = { x, y };

        const scaleStyle = x === 1 && y === 1 ? "" : `scale(${x}, ${y})`;
        const { style }  = this._element;

        // @ts-expect-error TS7015: Element implicitly has an 'any' type because index expression is not of type 'number'.
        style[ "-webkit-transform-origin" ] = style[ "transform-origin" ] = "0 0";

        // @ts-expect-error TS7015: Element implicitly has an 'any' type because index expression is not of type 'number'.
        style[ "-webkit-transform" ] = style[ "transform" ] = scaleStyle;

        this.invalidate();
    }
    
    stretchToFit( value: boolean ): void {
        this._stretchToFit = value;
        this.handleResize();
    }

    setFullScreen( value: boolean, stretchToFit = false ): void {
        if ( !stretchToFit ) {
            stretchToFit = this._stretchToFit; // take configured value in case it was defined
        }
        if ( !this._hasFsHandler ) {
            this._hasFsHandler = true;
            const d = document;

            const handleFullScreenChange = (): void => {
                // @ts-expect-error TS2551 vendor prefixes
                this._isFullScreen = ( d.webkitIsFullScreen || d.mozFullScreen || d.msFullscreenElement === true );
                if ( stretchToFit ) {
                    this._stretchToFit = this._isFullScreen;
                }
            };

            [ "webkitfullscreenchange", "mozfullscreenchange", "fullscreenchange", "MSFullscreenChange" ]
                .forEach( event => {
                    this._eventHandler.add( d, event, handleFullScreenChange );
                });
        }
        if ( value !== this._isFullScreen ) {
            toggleFullScreen( this._element );
        }
    }

    /**
     * return the bounding box of the canvas Element in the DOM
     */
    getCoordinate(): DOMRect {
        if ( this._coords === undefined ) {
            // to prevent expensive repeated calls to this method
            // coords should be nulled upon canvas resize or DOM layout changes
            this._coords = this._element.getBoundingClientRect();
        }
        return this._coords;
    }

    dispose(): void {
        if ( this._disposed ) {
            return;
        }
        this._animate = false;
        window.cancelAnimationFrame( this._renderId ); // kill render loop
        this.removeListeners();

        // dispose all sprites on Display List

        super.dispose();

        if ( this._element.parentNode ) {
            this._element.parentNode.removeChild( this._element );
        }
        
        // debounce disposing the renderer to not conflict with running render cycle
        requestAnimationFrame(() => {
            this._renderer.dispose();
            this._renderer = undefined;
            this.collision.dispose();
            this.collision = undefined;
        });
        this._disposed = true;
    }

    /* event handlers */

    protected handleInteraction( event: MouseEvent | TouchEvent | WheelEvent ): void {
        const numChildren = this._children.length;
        const viewport    = this._viewport;
        let theChild;

        if ( numChildren > 0 )
        {
            theChild = this._children[ numChildren - 1 ]; // reverse loop to first handle top layers

            switch ( event.type )
            {
                // all touch events
                default:
                    let eventOffsetX = 0, eventOffsetY = 0;

                    const touches = ( event as TouchEvent ).changedTouches;
                    let i = 0, l = touches.length;

                    if ( l > 0 ) {
                        let { x, y } = this.getCoordinate();
                        if ( viewport ) {
                            x -= viewport.left;
                            y -= viewport.top;
                        }

                        // zCanvas supports multitouch, process all pointers

                        for ( i = 0; i < l; ++i ) {
                            const touch          = touches[ i ];
                            const { identifier } = touch;

                            eventOffsetX = touch.pageX - x;
                            eventOffsetY = touch.pageY - y;

                            switch ( event.type ) {
                                // on touchstart events, when we a Sprite handles the event, we
                                // map the touch identifier to this Sprite
                                case "touchstart":
                                    while ( theChild ) {
                                        if ( !this._activeTouches.includes( theChild ) && theChild.handleInteraction( eventOffsetX, eventOffsetY, event )) {
                                            this._activeTouches[ identifier ] = theChild;
                                            break;
                                        }
                                        theChild = theChild.last;
                                    }
                                    theChild = this._children[ numChildren - 1 ];
                                    break;
                                // on all remaining touch events we retrieve the Sprite associated
                                // with the event pointer directly
                                default:
                                    theChild = this._activeTouches[ identifier ];
                                    if ( theChild?.handleInteraction( eventOffsetX, eventOffsetY, event )) {
                                        // all events other than touchmove should be treated as a release
                                        if ( event.type !== "touchmove" ) {
                                            this._activeTouches[ identifier ] = null;
                                        }
                                    }
                                    break;

                            }
                        }
                    }
                    break;

                // all mouse events
                case "mousedown":
                case "mousemove":
                case "mouseup":
                    let { offsetX, offsetY } = ( event as MouseEvent );
                    if ( this._isFullScreen ) {
                        const transformed = transformPointer( event as MouseEvent, this._element, this.getCoordinate(), this._width, this._height );
                        offsetX = transformed.x;
                        offsetY = transformed.y;
                    }
                    if ( viewport ) {
                        offsetX += viewport.left;
                        offsetY += viewport.top;
                    }
                    while ( theChild ) {
                        if ( theChild.handleInteraction( offsetX, offsetY, event )) {
                            break;
                        }
                        theChild = theChild.last;
                    }
                    break;

                // scroll wheel / touchpad
                case "wheel":
                    const { deltaX, deltaY } = ( event as WheelEvent );
                    const WHEEL_SPEED = 20;
                    const xSpeed = deltaX === 0 ? 0 : deltaX > 0 ? WHEEL_SPEED : -WHEEL_SPEED;
                    const ySpeed = deltaY === 0 ? 0 : deltaY > 0 ? WHEEL_SPEED : -WHEEL_SPEED;
                    this.panViewport( viewport.left + xSpeed, viewport.top + ySpeed, true );
                    break;
            }
        }
        if ( this._preventDefaults ) {
            event.stopPropagation();
            event.preventDefault();
        }

        // update the Canvas contents
        if ( !this._animate ) {
            this.invalidate();
        }
    }

    /* protected methods */

    /**
     * the render loop drawing the Objects onto the Canvas, shouldn't be
     * invoked directly but by the animation loop or an update request
     *
     * @param {DOMHighResTimeStamp} now time elapsed since document time origin
     */
    protected render( now: DOMHighResTimeStamp = 0 ): void {
        this._renderPending = false;
        const delta = now - this._lastRender;

        // for animatable canvas instances, ensure we cap the framerate
        // by deferring the render in case the actual framerate is above the
        // configured framerate of the canvas (this for instance prevents
        // 120 Hz Apple M1 rendering things too fast when you were expecting 60 fps)
       
        if ( this._animate && ( delta / this._renderInterval ) < 0.999 ) {
            this._renderId = window.requestAnimationFrame( this._renderHandler );
            this._lastRaf = now;
            return;
        }

        // calculate frame rate relative to last actual render

        this._aFps = 1000 / ( now - this._lastRaf );

        // the amount of frames the Sprite.update() steps should proceed
        // when the actual frame rate differs to configured frame rate

        let framesSinceLastRender;
        if ( this._fps > IDEAL_FPS ) {
            // zCanvas configured for a high refresh rate
            framesSinceLastRender = this._fps / this._aFps;
        } else if ( this._fps === IDEAL_FPS && this._aFps > HIGH_REFRESH_THROTTLE ) {
            // zCanvas configured for IDEAL_FPS and running on a high refresh rate configuration
            framesSinceLastRender = 1;
        } else {
            // zCanvas configured to run at a lower framerate than the IDEAL_FPS
            framesSinceLastRender = 1 / ( this._fps / this._aFps );
        }

        this._lastRaf    = now;
        this._lastRender = now - ( delta % this._renderInterval );

        // in case a resize was requested execute it now as we will
        // immediately draw new contents onto the screen

        if ( this._enqueuedSize ) {
            this.updateCanvasSize();
        }

        let theSprite;

        const width  = this._width;
        const height = this._height;

        // clear previous canvas contents either by flooding it
        // with the optional background colour, or by clearing all pixel content

        if ( this._bgColor ) {
            this._renderer.drawRect( 0, 0, width, height, this._bgColor );
        } else {
            this._renderer.clearRect( 0, 0, width, height );
        }

        const useExternalUpdateHandler = typeof this._updateHandler === "function";

        if ( useExternalUpdateHandler ) {
            this._updateHandler( now, framesSinceLastRender );
        }

        // draw the children onto the canvas

        theSprite = this._children[ 0 ];

        while ( theSprite ) {

            if ( !useExternalUpdateHandler ) {
                theSprite.update( now, framesSinceLastRender );
            }
            theSprite.draw( this._renderer, this._viewport );
            theSprite = theSprite.next;
        }

        this._renderer.onCommandsReady();

        // keep render loop going while Canvas is animatable

        if ( !this._disposed && this._animate ) {
            this._renderPending = true;
            this._renderId = window.requestAnimationFrame( this._renderHandler );
        }

        if ( this.DEBUG && now > 2 ) {
            const elapsed = window.performance.now() - now;

            this.benchmark.minElapsed = min( this.benchmark.minElapsed, elapsed );
            this.benchmark.maxElapsed = max( this.benchmark.maxElapsed, elapsed );

            if ( this._aFps !== Infinity ) {
                this.benchmark.minFps = min( this.benchmark.minFps, this._aFps );
                this.benchmark.maxFps = max( this.benchmark.maxFps, this._aFps );
            }
        }
    }

    /**
     * sprites have no HTML elements, the actual HTML listeners are
     * added onto the canvas, the Canvas will delegate events onto
     * the "children" of the canvas' Display List
     */
    protected addListeners( addResizeListener = false ): void {
        if ( !this._eventHandler ) {
            this._eventHandler = new EventHandler();
        }
        const theHandler  = this._eventHandler;
        const theListener = this.handleInteraction.bind( this );
        const element     = this._element;

        // use touch events ?
        if ( !!( "ontouchstart" in window )) {
            [ "start", "move", "end", "cancel" ].forEach( touchType => {
                theHandler.add( element, `touch${touchType}`,  theListener );
            });
        }
        [ "down", "move" ].forEach( mouseType => {
            theHandler.add( element, `mouse${mouseType}`, theListener );
        });
        theHandler.add( window, "mouseup", theListener ); // note: different element in listener

        if ( this._viewport ) {
            theHandler.add( element, "wheel", theListener );
        }
        if ( addResizeListener ) {
            theHandler.add( window, "resize", this.handleResize.bind( this ));
        }
        /*
        // pause the renderer on window blur/focus
        let wasAnimating = false;
        theHandler.add( window, "blur", () => {
            wasAnimating = this._animate;
            // this.setAnimatable( false );
        });
        theHandler.add( window, "focus", () => {
            this.setAnimatable( wasAnimating );
            this._lastRender = this._lastRaf;
        });*/
    }

    protected removeListeners(): void {
        this._eventHandler?.dispose();
        this._eventHandler = undefined;
    }

    protected handleResize(): void {
        // const { clientWidth, clientHeight } = document.documentElement;
        const { innerWidth, innerHeight } = window;

        let idealWidth  = this._preferredWidth;
        let idealHeight = this._preferredHeight;

        let scale = 1;

        const stretchToFit = !this._viewport && ( this._stretchToFit || innerWidth < idealWidth || innerHeight < idealHeight );

        if ( stretchToFit ) {

            // when stretching, the non-dominant side of the preferred rectangle will scale to reflect the
            // ratio of the available screen space, while the dominant side remains at its current size

            const { width, height } = constrainAspectRatio( idealWidth, idealHeight, innerWidth, innerHeight );

            scale = innerWidth / width;
            
            this.setDimensions( width, height, false, true );
        } else {                
            const ratio        = idealHeight / idealWidth;
            const targetWidth  = min( idealWidth, innerWidth );
            //const targetHeight = min( innerHeight, round( targetWidth * ratio ));
        
            this.setDimensions( idealWidth, idealHeight, false );
        
            // the viewport however is local to the client window size
            /*
            if ( this._viewport ) {
                const viewportWidth  = targetWidth  / scale;
                const viewportHeight = targetHeight / scale;
                
                this.setViewport( viewportWidth, viewportHeight );
            }*/
        }

        // we override the scale adjustment performed by updateCanvasSize above as
        // we lock the scaleed to the ratio of the desired to actual screen dimensions

        this.scale( scale );
    }

    protected updateCanvasSize(): void {
        const scaleFactor = this._pxr;

        let width: number;
        let height: number;
    
        if ( this._enqueuedSize !== undefined ) {
            ({ width, height } = this._enqueuedSize );
            this._enqueuedSize = undefined;
            this._width  = width;
            this._height = height;

            this.bbox.right  = width;
            this.bbox.bottom = height;
        }
    
        if ( this._viewport ) {
            const cvsWidth  = this._width;
            const cvsHeight = this._height;
    
            width  = min( this._viewport.width,  cvsWidth );
            height = min( this._viewport.height, cvsHeight );
    
            // in case viewport was panned beyond the new canvas dimensions
            // reset pan to center.
            /*
            if ( this._viewport.left > cvsWidth ) {
                this._viewport.left  = cvsWidth * .5;
                this._viewport.right = this._viewport.width + this._viewport.left;
            }
            if ( viewport.top > cvsHeight ) {
                this._viewport.top    = cvsHeight * .5;
                this._viewport.bottom = this._viewport.height + this._viewport.top;
            }
            */
        }
    
        if ( width && height ) {
            const element = this.getElement();
    
            this._renderer.setDimensions( width * scaleFactor, height * scaleFactor );
    
            element.style.width  = `${width}px`;
            element.style.height = `${height}px`;

            this._resizeHandler?.( width, height );
        }
        this._renderer.scale( scaleFactor );
    
        // non-smoothing must be re-applied when the canvas dimensions change...
    
        this.setSmoothing( this._smoothing );
        this._coords = undefined; // invalidate cached bounding box
    }    
}
