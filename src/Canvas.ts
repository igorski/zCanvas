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
import { imageToCanvas } from "./utils/ImageUtil";
import { useWorker } from "./utils/Optimization";
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

export interface CanvasProps {
    width?: number;
    height?: number;
    fps?: number;
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
    /*
    public benchmark = {
        minElapsed: Infinity,
        maxElapsed: -Infinity,
        minFps: Infinity,
        maxFps: -Infinity,
    };*/
    public collision: Collision;
    public bbox: BoundingBox = { left: 0, top: 0, right: 0, bottom: 0 }; // relative to Sprites, not DOM!

    protected _el: HTMLCanvasElement; // the HTMLCanvasElement managed by this zCanvas
    protected _rdr: RenderAPI;        // the RenderAPI used for drawing on the canvas
    protected _vp: Viewport | undefined; // optional Viewport
    protected _smooth = false;
    protected _stretch = false;
    protected _pxr = 1;

    protected _renHdlr: ( now: DOMHighResTimeStamp ) => void;
    protected _upHdlr?: ( now: DOMHighResTimeStamp, framesSinceLastRender: number ) => void;
    protected _resHdrl?: ( width: number, height: number ) => void;
    protected _vpHdlr?: ({}: { type: "panned", value: Viewport }) => void;
    protected _hdlr: EventHandler; // event handler map
    protected _prevDef = false;    // whether to prevent Event defaults
  
    protected _lastRender = 0;
    protected _renderId = 0;
    protected _renderPending = false;
  
    protected _disposed = false;
    protected _scale: Point = { x: 1, y: 1 };
    protected _aTchs: Sprite[] = []; // Sprites that are currently mapped to touch pointers
    protected _coords: DOMRect | undefined;
    protected _width: number;
    protected _height: number;
    protected _prefWidth: number;
    protected _prefHeight: number;
    protected _qSize: Size | undefined; // size enqueued to be set on next render cycle
    
    protected _animate = false;
    protected _frstRaf: DOMHighResTimeStamp;
    protected _fps: number;   // intended framerate
    protected _aFps: number;  // actual framerate (calculated at runtime)
    protected _rIval: number; // the render interval
    protected _bgColor: string | undefined;

    protected _isFs = false;   // whether zCanvas is currently fullscreen
    protected _hasFsH = false; // whether a fullscreen handler is registered
    
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

        this._el  = document.createElement( "canvas" );
        this._rdr = new RenderAPI( this._el, { debug, alpha: !backgroundColor, useOffscreen: useWorker( optimize ) });
        this.collision = new Collision( this._rdr );

        this._upHdlr   = onUpdate;
        this._renHdlr   = this.render.bind( this );
        this._vpHdlr = viewportHandler;
        this._resHdrl   = onResize;

        this.setFrameRate( fps );
        this.setAnimatable( animate );

        if ( backgroundColor ) {
            this.setBackgroundColor( backgroundColor );
        }

        // ensure all is crisp clear on HDPI screens

        this._pxr = window.devicePixelRatio || 1;
        this._rdr.setPixelRatio( this._pxr );

        this.setDimensions( width, height, true, true );
        if ( viewport ) {
            this.setViewport( viewport.width, viewport.height );
        }
        this._stretch = stretchToFit;

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
        return this._rdr.loadResource( id, source );
    }

    getResource( id: string ): Promise<ImageBitmap | undefined> {
        return this._rdr.getResource( id );
    }

    disposeResource( id: string ): void {
        return this._rdr.disposeResource( id );
    }

    async getContent( resourceId?: string ): Promise<HTMLCanvasElement> {
        const output = document.createElement( "canvas" );
        if ( resourceId ) {
            const bitmap = await this.getResource( resourceId );
            imageToCanvas( output, bitmap );
        } else {
            imageToCanvas( output, this._el );
        }
        return output;
    }

    getRenderer(): IRenderer {
        return this._rdr;
    }

    /**
     * appends this Canvas to the DOM (i.e. adds the references <canvas>-
     * element into the supplied container
     *
     * @param {HTMLElement} container DOM node to append the Canvas to
     */
    insertInPage( container: HTMLElement ): void {
        if ( this._el.parentNode ) {
            throw new Error( "Canvas already present in DOM" );
        }
        container.appendChild( this._el );
    }

    /**
     * get the <canvas>-element inside the DOM that is used
     * to render this Canvas' contents
     */
    getElement(): HTMLCanvasElement {
        return this._el;
    }

    /**
     * whether or not all events captured by the Canvas can
     * bubble down in the document, when true, DOM events that
     * have interacted with the Canvas will stop their propagation
     * and prevent their default behaviour
     */
    preventEventBubbling( value: boolean ): void {
        this._prevDef = value;
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
            this._renderId = window.requestAnimationFrame( this._renHdlr );
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
        this._rIval = 1000 / value;
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
        return this._rIval;
    }

    getSmoothing(): boolean {
        return this._smooth;
    }

    /**
     * toggle the smoothing of the Canvas' contents.
     * for pixel art-type graphics, setting the smoothing to
     * false will yield crisper results
     */
    setSmoothing( enabled: boolean ): void {
        // 1. update context
        this._rdr.setSmoothing( enabled );
        // 2. update Canvas Element in DOM
        if ( enabled ) {
            // @ts-expect-error TS7015: Element implicitly has an 'any' type because index expression is not of type 'number'.
            this._el.style[ "image-rendering" ] = "";
        } else {
            [ "-moz-crisp-edges", "-webkit-crisp-edges", "pixelated", "crisp-edges" ]
            .forEach( style => {
                // @ts-expect-error TS7015: Element implicitly has an 'any' type because index expression is not of type 'number'.
                this._el.style[ "image-rendering" ] = style;
            });
        }
        this._smooth = enabled;
        this.invalidate();
    }

    getWidth(): number {
        return ( this._qSize ) ? this._qSize.width : this._width;
    }

    getHeight(): number {
        return ( this._qSize ) ? this._qSize.height : this._height;
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
        this._qSize = { width, height };

        if ( setAsPreferredDimensions ) {
            this._prefWidth  = width;
            this._prefHeight = height;
        }

        if ( immediate ) {
            this.updateCanvasSize();
        }
        this.invalidate();
    }

    getViewport(): Viewport | undefined {
        return this._vp;
    }

    /**
     * In case the Canvas isn't fully visible (for instance because it is part
     * of a scrollable container), you can define the visible bounds (relative to
     * the full Canvas width/height) here. This can be used to improve rendering
     * performance on large Canvas instances by only rendering the visible area.
     */
    setViewport( width: number, height: number ): void {
        if ( !this._vp ) {
            this._vp = { width, height, left: 0, top: 0, right: width, bottom: height };
        }
        const vp = this._vp;

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
        const vp  = this._vp;

        vp.left   = max( 0, min( x, this._width - vp.width ));
        vp.right  = vp.left + vp.width;
        vp.top    = max( 0, min( y, this._height - vp.height ));
        vp.bottom = vp.top + vp.height;

        this.invalidate();

        if ( broadcast ) {
            this._vpHdlr?.({ type: "panned", value: vp });
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
        if ( value ) {
            this._frstRaf = window.performance.now();
            if ( !this._renderPending ) {
                this.invalidate();
            }
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
        const { style }  = this._el;

        // @ts-expect-error TS7015: Element implicitly has an 'any' type because index expression is not of type 'number'.
        style[ "-webkit-transform-origin" ] = style[ "transform-origin" ] = "0 0";

        // @ts-expect-error TS7015: Element implicitly has an 'any' type because index expression is not of type 'number'.
        style[ "-webkit-transform" ] = style[ "transform" ] = scaleStyle;

        this.invalidate();
    }
    
    stretchToFit( value: boolean ): void {
        this._stretch = value;
        this.handleResize();
    }

    setFullScreen( value: boolean, stretchToFit = false ): void {
        if ( !stretchToFit ) {
            stretchToFit = this._stretch; // take configured value in case it was defined
        }
        if ( !this._hasFsH ) {
            this._hasFsH = true;
            const d = document;

            const handleFullScreenChange = (): void => {
                // @ts-expect-error TS2551 vendor prefixes
                this._isFs = ( d.webkitIsFullScreen || d.mozFullScreen || d.msFullscreenElement === true );
                if ( stretchToFit ) {
                    this._stretch = this._isFs;
                }
            };

            [ "webkitfullscreenchange", "mozfullscreenchange", "fullscreenchange", "MSFullscreenChange" ]
                .forEach( event => {
                    this._hdlr.add( d, event, handleFullScreenChange );
                });
        }
        if ( value !== this._isFs ) {
            toggleFullScreen( this._el );
        }
    }

    /**
     * return the bounding box of the canvas Element in the DOM
     */
    getCoordinate(): DOMRect {
        if ( this._coords === undefined ) {
            // to prevent expensive repeated calls to this method
            // coords should be nulled upon canvas resize or DOM layout changes
            this._coords = this._el.getBoundingClientRect();
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

        if ( this._el.parentNode ) {
            this._el.parentNode.removeChild( this._el );
        }
        
        // debounce disposing the renderer to not conflict with running render cycle
        requestAnimationFrame(() => {
            this._rdr.dispose();
            this._rdr = undefined;
            this.collision.dispose();
            this.collision = undefined;
        });
        this._disposed = true;
    }

    /* event handlers */

    protected handleInteraction( event: MouseEvent | TouchEvent | WheelEvent ): void {
        const numChildren = this._children.length;
        const viewport    = this._vp;
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

                    // in case canvas is scaled to fit, we need to transform the touch coordinates

                    const xScale = 1 / this._scale.x;
                    const yScale = 1 / this._scale.y;

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

                            eventOffsetX = ( touch.pageX * xScale ) - x;
                            eventOffsetY = ( touch.pageY * yScale ) - y;

                            switch ( event.type ) {
                                // on touchstart events, when we a Sprite handles the event, we
                                // map the touch identifier to this Sprite
                                case "touchstart":
                                    while ( theChild ) {
                                        if ( !this._aTchs.includes( theChild ) && theChild.handleInteraction( eventOffsetX, eventOffsetY, event )) {
                                            this._aTchs[ identifier ] = theChild;
                                            break;
                                        }
                                        theChild = theChild.last;
                                    }
                                    theChild = this._children[ numChildren - 1 ];
                                    break;
                                // on all remaining touch events we retrieve the Sprite associated
                                // with the event pointer directly
                                default:
                                    theChild = this._aTchs[ identifier ];
                                    if ( theChild?.handleInteraction( eventOffsetX, eventOffsetY, event )) {
                                        // all events other than touchmove should be treated as a release
                                        if ( event.type !== "touchmove" ) {
                                            this._aTchs[ identifier ] = null;
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
                    if ( this._isFs ) {
                        const transformed = transformPointer(
                            event as MouseEvent, this._el, this.getCoordinate(),
                            this._width, this._height
                        );
                        // note we also need to take HDPI scale into account
                        offsetX = transformed.x / this._pxr;
                        offsetY = transformed.y / this._pxr;
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
        if ( this._prevDef ) {
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
       
        if ( this._animate && ( delta / this._rIval ) < 0.99 ) {
            this._renderId = window.requestAnimationFrame( this._renHdlr );
            return;
        }
        // calculate frame rate relative to last actual render

if (this.frameCount === undefined) {
    this.frameCount = 0;
}
++this.frameCount;


        this._aFps = 1000 / (( now - this._frstRaf ) / this.frameCount );

        // the amount of frames the Sprite.update() steps should proceed
        // when the actual frame rate differs to configured frame rate

        const framesSinceLastRender = delta / this._rIval;

        this._frstRaf    = now;
        this._lastRender = now - ( delta % this._rIval );

        // in case a resize was requested execute it now as we will
        // immediately draw new contents onto the screen

        if ( this._qSize ) {
            this.updateCanvasSize();
        }

        const width  = this._width;
        const height = this._height;

        // clear previous canvas contents either by flooding it
        // with the optional background colour, or by clearing all pixel content

        if ( this._bgColor ) {
            this._rdr.drawRect( 0, 0, width, height, this._bgColor );
        } else {
            this._rdr.clearRect( 0, 0, width, height );
        }

        const useExternalUpdateHandler = typeof this._upHdlr === "function";

        if ( useExternalUpdateHandler ) {
            this._upHdlr( now, framesSinceLastRender );
        }

        // draw the children onto the canvas

        let sprite = this._children[ 0 ];

        while ( sprite ) {

            if ( !useExternalUpdateHandler ) {
                sprite.update( now, framesSinceLastRender );
            }
            sprite.draw( this._rdr, this._vp );
            sprite = sprite.next;
        }

        this._rdr.onCommandsReady();

        // keep render loop going while Canvas is animatable

        if ( !this._disposed && this._animate ) {
            this._renderPending = true;
            this._renderId = window.requestAnimationFrame( this._renHdlr );
        }
    }

    /**
     * sprites have no HTML elements, the actual HTML listeners are
     * added onto the canvas, the Canvas will delegate events onto
     * the "children" of the canvas' Display List
     */
    protected addListeners( addResizeListener = false ): void {
        if ( !this._hdlr ) {
            this._hdlr = new EventHandler();
        }
        const theHandler  = this._hdlr;
        const theListener = this.handleInteraction.bind( this );
        const element     = this._el;

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

        if ( this._vp ) {
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
        this._hdlr?.dispose();
        this._hdlr = undefined;
    }

    protected handleResize(): void {
        // const { clientWidth, clientHeight } = document.documentElement;
        const { innerWidth, innerHeight } = window;

        let idealWidth  = this._prefWidth;
        let idealHeight = this._prefHeight;

        let scale = 1;

        const stretchToFit = !this._vp && this._stretch;//( this._stretchToFit || innerWidth < idealWidth || innerHeight < idealHeight );

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

            // when the ideal dimensions exceed the available bounds, scale the Canvas down
            if ( !this._vp ) {
                if ( idealWidth > innerWidth ) {
                    scale = innerWidth / idealWidth;
                }
            }
        }

        // we override the scale adjustment performed by updateCanvasSize above as
        // we lock the scaleed to the ratio of the desired to actual screen dimensions

        this.scale( scale );
    }

    protected updateCanvasSize(): void {
        // when smoothing is disabled, there's no need to scale to correct for HDPI screen
        const scaleFactor = this._smooth ? this._pxr : 1;

        let width: number;
        let height: number;
    
        if ( this._qSize !== undefined ) {
            ({ width, height } = this._qSize );
            this._qSize = undefined;
            this._width  = width;
            this._height = height;

            this.bbox.right  = width;
            this.bbox.bottom = height;
        }
    
        if ( this._vp ) {
            const cvsWidth  = this._width;
            const cvsHeight = this._height;
    
            width  = min( this._vp.width,  cvsWidth );
            height = min( this._vp.height, cvsHeight );
    
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
    
            this._rdr.setDimensions( width * scaleFactor, height * scaleFactor );
    
            element.style.width  = `${width}px`;
            element.style.height = `${height}px`;

            this._resHdrl?.( width, height );
        }
        this._rdr.scale( scaleFactor );
    
        // non-smoothing must be re-applied when the canvas dimensions change...
    
        this.setSmoothing( this._smooth );
        this._coords = undefined; // invalidate cached bounding box
    }    
}
