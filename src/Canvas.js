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
import EventHandler from "./utils/event-handler.js";
import Inheritance  from "./utils/inheritance.js";

const { min, max, round } = Math;

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

/**
 * creates an API for an HTMLCanvasElement where all drawables are treated as
 * self-contained Objects that can add/remove themselves from the DisplayList, rather
 * than having a single function aggregating all drawing instructions
 *
 * @constructor
 * @param {{
 *            width?: number,
 *            height?: number,
 *            fps?: number,
 *            scale?: number,
 *            backgroundColor?: string,
 *            animate?: boolean,
 *            smoothing?: boolean,
 *            stretchToFit?: boolean,
 *            viewport?: Size,
 *            handler?: Function,
 *            preventEventBubbling?: boolean,
 *            parentElement?: null,
 *            onUpdate?: Function,
 *            debug?: boolean
 *        }}
 */
function Canvas({
    width = 300, height = 300, fps = IDEAL_FPS, scale = 1, backgroundColor = null,
    animate = false, smoothing = true, stretchToFit = false, viewport = null, handler = null,
    preventEventBubbling = false, parentElement = null, debug = false, onUpdate = null
} = {}) {

    if ( width <= 0 || height <= 0 ) {
        throw new Error( "cannot construct a zCanvas without valid dimensions" );
    }

    /* instance properties */

    /** @public @type {boolean} */          this.DEBUG           = debug;
    /** @protected @type {boolean} */       this._smoothing      = smoothing;
    /** @protected @type {Function} */      this._updateHandler  = onUpdate;
    /** @protected @type {Function} */      this._renderHandler  = this.render.bind( this );
    /** @protected @type {number} */        this._lastRender     = 0;
    /** @protected @type {number} */        this._renderId       = 0;
    /** @protected @type {boolean} */       this._renderPending  = false;
    /** @protected @type {boolean} */       this._disposed       = false;
    /** @protected @type {object} */        this._scale          = { x: scale, y: scale };
    /** @protected @type {Function} */      this._handler        = handler;
    /** @protected @type {Array<Sprite>} */ this._activeTouches  = [];
    /** @protected @type {Array<Sprite>} */ this._children       = [];
    /** @protected @type {DOMRect} */       this._coords         = null;

    /* initialization */

    this.setFrameRate( fps );
    this.setAnimatable( animate );

    /**
     * @protected
     * @type {HTMLCanvasElement}
     */
    this._element = /** @type {HTMLCanvasElement} */ ( document.createElement( "canvas" ));

    /**
     * @protected
     * @type {CanvasRenderingContext2D}
     */
    this._canvasContext = this._element.getContext( "2d" );

    if ( !!backgroundColor ) {
        this.setBackgroundColor( backgroundColor );
    }

    // ensure all is crisp clear on HDPI screens
    const ctx = this._canvasContext;

    const devicePixelRatio  = window.devicePixelRatio || 1;
    const backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                                 ctx.mozBackingStorePixelRatio ||
                                  ctx.msBackingStorePixelRatio ||
                                   ctx.oBackingStorePixelRatio ||
                                    ctx.backingStorePixelRatio || 1;

    const ratio = devicePixelRatio / backingStoreRatio;

    /** @protected @type {number} */ this._HDPIscaleRatio = ( devicePixelRatio !== backingStoreRatio ) ? ratio : 1;

    this.setDimensions( width, height, true, true );
    if ( viewport ) {
        this.setViewport( viewport.width, viewport.height );
    }

    if ( scale !== 1 ) {
        this.scale( scale, scale );
    }
    if ( stretchToFit ) {
        this.stretchToFit( true );
    }
    if ( parentElement instanceof Element ) {
        this.insertInPage( parentElement );
    }
    this.setSmoothing( smoothing );
    this.preventEventBubbling( preventEventBubbling );
    this.addListeners();

    if ( this._animate ) {
        this.render();  // start render loop
    }
}
export default Canvas;

/**
 * extend a given Function reference with the Canvas prototype, you
 * can use this to create custom Canvas extensions. From the extensions
 * you can call:
 *
 * InheritingPrototype.super( extensionInstance, methodName, var_args...)
 *
 * to call Canvas prototype functions from overriding function declarations
 * if you want to call the constructor, methodName is "constructor"
 *
 * @public
 * @param {!Function} extendingFunction reference to
 *        function which should inherit the Canvas prototype
 * @returns {Canvas} subclass
 */
Canvas.extend = function( extendingFunction ) {
    Inheritance.extend( extendingFunction, Canvas );
};

/* public methods */

/**
 * appends this Canvas to the DOM (i.e. adds the references <canvas>-
 * element into the supplied container
 *
 * @public
 * @param {HTMLElement} aContainer DOM node to append the Canvas to
 */
Canvas.prototype.insertInPage = function( aContainer ) {
    if ( this._element.parentNode ) {
        throw new Error( "Canvas already present in DOM" );
    }
    aContainer.appendChild( this._element );
};

/**
 * get the <canvas>-element inside the DOM that is used
 * to render this Canvas' contents
 *
 * @public
 * @return {HTMLCanvasElement}
 */
Canvas.prototype.getElement = function() {
    return this._element;
};

/**
 * @public
 * @return {CanvasRenderingContext2D}
 */
Canvas.prototype.getCanvasContext = function() {
    return this._canvasContext;
};

/**
 * whether or not all events captured by the Canvas can
 * bubble down in the document, when true, DOM events that
 * have interacted with the Canvas will stop their propagation
 * and prevent their default behaviour
 *
 * @public
 * @param {boolean} value
 */
Canvas.prototype.preventEventBubbling = function( value ) {
    /**
     * @protected
     * @type {boolean}
     */
    this._preventDefaults = value;
};

/**
 * @public
 * @param {Sprite} aChild
 * @return {Canvas} this Canvas - for chaining purposes
 */
Canvas.prototype.addChild = function( aChild ) {
    if ( this.contains( aChild )) {
        return this;
    }
    // create a linked list
    const numChildren = this._children.length;

    if ( numChildren > 0 ) {
        aChild.last      = this._children[ numChildren - 1 ];
        aChild.last.next = aChild;
    }
    aChild.next = null;
    aChild.setCanvas( this );
    aChild.setParent( this );

    this._children.push( aChild );
    this.invalidate();

    return this;
};

/**
 * @public
 * @param {Sprite} aChild the child to remove from this Canvas
 *
 * @return {Sprite} the removed child - for chaining purposes
 */
Canvas.prototype.removeChild = function( aChild ) {
    aChild.setParent( null );
    aChild.setCanvas( null );

    //aChild.dispose(); // no, we might like to re-use the child at a later stage!

    const childIndex = this._children.indexOf( aChild );
    if ( childIndex !== -1 ) {
        this._children.splice( childIndex, 1 );
    }

    // update linked list

    const prevChild = aChild.last;
    const nextChild = aChild.next;

    if ( prevChild ) {
        prevChild.next = nextChild;
    }
    if ( nextChild ) {
        nextChild.last = prevChild;
    }
    aChild.last = aChild.next = null;

    // request a render now the state of the canvas has changed

    this.invalidate();

    return aChild;
};

/**
 * retrieve a child of this Canvas by its index in the Display List
 *
 * @public
 *
 * @param {number} index of the object in the Display List
 * @return {Sprite} the referenced object
 */
Canvas.prototype.getChildAt = function( index ) {
    return this._children[ index ];
};

/**
 * remove a child from this Canvas' Display List at the given index
 *
 * @public
 * @param {number} index of the object to remove
 * @return {Sprite} the removed sprite
 */
Canvas.prototype.removeChildAt = function( index ) {
    return this.removeChild( this.getChildAt( index ));
};

/**
 * @public
 * @return {number} the amount of children in this object's Display List
 */
Canvas.prototype.numChildren = function() {
    return this._children.length;
};

/**
 * @public
 * @return {Array<Sprite>}
 */
Canvas.prototype.getChildren = function() {
    return this._children;
};

/**
 * check whether a given display object is present in this object's display list
 *
 * @public
 * @param {Sprite} aChild
 *
 * @return {boolean}
 */
Canvas.prototype.contains = function( aChild ) {
    return aChild._parent === this;
};

/**
 * invoke when the state of the Canvas has changed (i.e.
 * the visual contents should change), this will invoke
 * a new render request
 *
 * render requests are only executed when the UI is ready
 * to render (on animationFrame), as such this method can be invoked
 * repeatedly between render cycles without actually triggering
 * multiple render executions (a single one will suffice)
 *
 * @public
 */
Canvas.prototype.invalidate = function() {
    if ( !this._animate && !this._renderPending ) {
        this._renderPending = true;
        this._renderId = window.requestAnimationFrame( this._renderHandler );
    }
};

/**
 * return the framerate of the Canvas, can be queried by
 * child sprites to calculate strictly timed animated operations
 *
 * @public
 * @return {number}
 */
Canvas.prototype.getFrameRate = function() {
    return this._fps;
};

/**
 * sets the framerate of the Canvas
 *
 * @public
 * @param {number} value
 */
Canvas.prototype.setFrameRate = function( value ) {
    /**
     * @protected
     * @type {number}
     */
    this._fps = value;

    /**
     * The actual framerate (calculated at runtime)
     *
     * @protected
     * @type {number}
     */
    this._aFps = value;

    /**
     * @protected
     * @type {number}
     */
     this._renderInterval = 1000 / value; // milliseconds per frame
};

/**
 * Returns the actual framerate achieved by the zCanvas renderer
 *
 * @public
 * @return {number}
 */
Canvas.prototype.getActualFrameRate = function() {
    return this._aFps;
};

/**
 * retrieve the render interval for this Canvas, this basically
 * describes the elapsed time in milliseconds between each successive
 * render at the current framerate
 *
 * @public
 * @return {number}
 */
Canvas.prototype.getRenderInterval = function() {
    return this._renderInterval;
};

/**
 * @public
 * @return {boolean}
 */
Canvas.prototype.getSmoothing = function() {
    return this._smoothing;
};

/**
 * toggle the smoothing of the Canvas' contents.
 * for pixel art-type graphics, setting the smoothing to
 * false will yield crisper results
 *
 * @public
 * @param {boolean} enabled
 */
Canvas.prototype.setSmoothing = function( enabled ) {
    // 1. context smoothing state
    const props = [ "imageSmoothingEnabled",  "mozImageSmoothingEnabled",
                    "oImageSmoothingEnabled", "webkitImageSmoothingEnabled" ];

    // 2. canvas rendering CSS style
    const styles = [
        "-moz-crisp-edges", "-webkit-crisp-edges", "pixelated", "crisp-edges"
    ];
    this._smoothing = enabled;

    const canvasStyle = this._element.style;
    const context     = this._canvasContext;

    props.forEach( prop => {
        if ( context[ prop ] !== undefined ) {
            context[ prop ] = enabled;
        }
    });
    styles.forEach( style => {
        canvasStyle[ "image-rendering" ] = enabled ? undefined : style;
    });
    this.invalidate();
};

/**
 * @public
 * @return {number}
 */
Canvas.prototype.getWidth = function() {
    return ( this._enqueuedSize ) ? this._enqueuedSize.width : this._width;
};

/**
 * @public
 * @return {number}
 */
Canvas.prototype.getHeight = function() {
    return ( this._enqueuedSize ) ? this._enqueuedSize.height : this._height;
};

/**
 * updates the dimensions of the Canvas (this actually enqueues the update and will only
 * execute it once the canvas draws to prevent flickering on constants resize operations
 * as browsers will clear the existing Canvas content when adjusting its dimensions)
 *
 * @public
 * @param {number} width
 * @param {number} height
 * @param {boolean=} setAsPreferredDimensions optional, defaults to true, stretchToFit handler
 *        overrides this to ensure returning to correct dimensions when disabling stretchToFit
 * @param {boolean=} optImmediate optional, whether to apply immediately, defaults to false
 *        to prevent flickering of existing screen contents during repeated resize
 */
Canvas.prototype.setDimensions = function( width, height, setAsPreferredDimensions = true, optImmediate = false ) {
    /**
     * @protected
     * @type {Size}
     */
    this._enqueuedSize = { width, height };

    if ( setAsPreferredDimensions === true ) {
        /** @protected @type {number} */ this._preferredWidth  = width;
        /** @protected @type {number} */ this._preferredHeight = height;
    }

    if ( optImmediate === true ) {
        updateCanvasSize( this );
    }
    this.invalidate();
};

/**
 * @public
 * @return {Viewport}
 */
Canvas.prototype.getViewport = function() {
    return this._viewport;
};

/**
 * In case the Canvas isn't fully visible (for instance because it is part
 * of a scrollable container), you can define the visible bounds (relative to
 * the full Canvas width/height) here. This can be used to improve rendering
 * performance on large Canvas instances by only rendering the visible area.
 *
 * @public
 * @param {number} width
 * @param {number} height
 */
Canvas.prototype.setViewport = function( width, height ) {
    /**
     * @protected
     * @type {Viewport}
     */
     this._viewport = { width, height };
     this.panViewport( 0, 0 );
     updateCanvasSize( this );
};

/**
 * Updates the horizontal and vertical position of the viewport.
 *
 * @public
 * @param {number} x
 * @param {number} y
 * @param {boolean=} broadcast optionally broadcast change to registered handler
 */
Canvas.prototype.panViewport = function( x, y, broadcast = false ) {
    const vp  = this._viewport;

    vp.left   = max( 0, min( x, this._width - vp.width ));
    vp.right  = vp.left + vp.width;
    vp.top    = max( 0, min( y, this._height - vp.height ));
    vp.bottom = vp.top + vp.height;

    this.invalidate();

    if ( broadcast ) {
        this._handler?.({ type: "panned", value: vp });
    }
};

/**
 * set the background color for the Canvas, either hexadecimal
 * or RGB/RGBA, e.g. "#FF0000" or "rgba(255,0,0,1)";
 *
 * @public
 * @param {string} color
 */
Canvas.prototype.setBackgroundColor = function( color ) {
    /**
     * @protected
     * @type {string}
     */
    this._bgColor = color;
};

/**
 * @public
 * @param {boolean} value
 */
Canvas.prototype.setAnimatable = function( value ) {
    const oldValue = this._animate;

    /**
     * @protected
     * @type {boolean}
     */
    this._animate = value;

    /**
     * timestamp of last requestAnimationFrame callback
     *
     * @protected
     * @type {DOMHighResTimeStamp}
     */
    this._lastRaf = window.performance?.now() || Date.now();

    if ( value && !this._renderPending ) {
        this._renderHandler( this._lastRaf );
    }
};

/**
 * @public
 * @return {boolean}
 */
Canvas.prototype.isAnimatable = function() {
    return this._animate;
};

/**
 * safe method to draw Image data onto canvas while sanitizing the destination values to
 * overcome IndexSizeErrors and other nastiness
 *
 * @public
 *
 * @param {HTMLImageElement|HTMLCanvasElement} aSource canvas drawable to draw
 * @param {number} destX destination x-coordinate of given image
 * @param {number} destY destination y-coordinate of given image
 * @param {number} destWidth destination width of given image
 * @param {number} destHeight destination width of given image
 * @param {number=} aOptSourceX optional, whether to use an alternative x-coordinate for the source rectangle
 * @param {number=} aOptSourceY optional, whether to use an alternative y-coordinate for the source rectangle
 * @param {number=} aOptSourceWidth optional, whether to use an alternative width for the source rectangle
 * @param {number=} aOptSourceHeight optional, whether to use an alternative height for the source rectangle
 */
Canvas.prototype.drawImage = function( aSource, destX, destY, destWidth, destHeight,
    aOptSourceX, aOptSourceY, aOptSourceWidth, aOptSourceHeight ) {

    // we add .5 to have a pixel perfect outline
    // << 0 is a fast bitwise rounding operation (Firefox does not like fractions and we like speed ;)

    destX      = ( .5 + destX ) << 0;
    destY      = ( .5 + destY ) << 0;
    destWidth  = ( .5 + destWidth )  << 0;
    destHeight = ( .5 + destHeight ) << 0;

    // INDEX_SIZE_ERR is thrown when target dimensions are zero or negative
    // nothing worthwhile to render in that case, do nothing please.

    if ( destWidth <= 0 || destHeight <= 0 ) {
        return;
    }

    const ctx = this._canvasContext;

    // use 9-arity draw method if source rectangle is defined

    if ( typeof aOptSourceX === "number" ) {

        // clipping rectangle doesn't have to exceed <canvas> dimensions
        destWidth  = min( ctx.canvas.width,  destWidth );
        destHeight = min( ctx.canvas.height, destHeight );

        const xScale = destWidth  / aOptSourceWidth;
        const yScale = destHeight / aOptSourceHeight;

        // when clipping the source region should remain within the image dimensions

        if ( aOptSourceX + aOptSourceWidth > aSource.width ) {
            destWidth       -= xScale * (aOptSourceX + aOptSourceWidth - aSource.width);
            aOptSourceWidth -= (aOptSourceX + aOptSourceWidth - aSource.width);
        }
        if ( aOptSourceY + aOptSourceHeight > aSource.height ) {
            destHeight       -= yScale * (aOptSourceY + aOptSourceHeight - aSource.height);
            aOptSourceHeight -= (aOptSourceY + aOptSourceHeight - aSource.height);
        }

        ctx.drawImage(
            aSource,
            // no rounding required here as these are integer values
            aOptSourceX, aOptSourceY, aOptSourceWidth, aOptSourceHeight,
            // but we do round the target coordinates
            destX, destY, destWidth, destHeight
        );
    }
    else {
        ctx.drawImage( aSource, destX, destY, destWidth, destHeight );
    }
};

/**
 * Scales the canvas Element. This can be used to render content at a lower
 * resolution but scale it up to fit the screen (for instance when rendering pixel art
 * with smoothing disabled for crisp definition).
 *
 * @public
 * @param {number} x the factor to scale the horizontal axis by
 * @param {number=} y the factor to scale the vertical axis by, defaults to x
 */
Canvas.prototype.scale = function( x, y = x ) {
    this._scale = { x, y };

    const scaleStyle = x === 1 && y === 1 ? '' : `scale(${x}, ${y})`;
    const { style }  = this._element;

    style[ "-webkit-transform-origin" ] =
            style[ "transform-origin" ] = "0 0";

    style[ "-webkit-transform" ] =
            style[ "transform" ] = scaleStyle;

    this.invalidate();
};

/**
 * Stretches the Canvas to fit inside the available window size, keeping the
 * dominant sides of the preferred dimensions in relation to the window dimensions.
 * This method will disregard scaling factors.
 *
 * @public
 * @param {boolean=} value whether to stretch the canvas to fit the window size
 */
Canvas.prototype.stretchToFit = function( value ) {
    /**
     * @protected
     * @type {boolean}
     */
    this._stretchToFit = value;

    const { innerWidth, innerHeight } = window;

    let targetWidth  = this._preferredWidth;
    let targetHeight = this._preferredHeight;
    let xScale       = 1;
    let yScale       = 1;

    if ( innerHeight > innerWidth ) {
        // available height is larger than the width
        targetHeight = !!value ? innerHeight / innerWidth * targetWidth : targetHeight;
        xScale = innerWidth  / targetWidth;
        yScale = innerHeight / targetHeight;
    }
    else {
        // available width is larger than the height
        targetWidth = !!value ? innerWidth / innerHeight * targetHeight : targetWidth;
        xScale = innerWidth  / targetWidth;
        yScale = innerHeight / targetHeight;
    }
    this.setDimensions( round( targetWidth ), round( targetHeight ), false, true );

    // we override the scale adjustment performed by updateCanvasSize as
    // we lock the scale to the ratio of the desired to actual screen dimensions
    this.scale( xScale, yScale );
};

/**
 * @public
 */
Canvas.prototype.dispose = function() {
    if ( this._disposed ) {
        return;
    }
    this._animate = false;
    window.cancelAnimationFrame( this._renderId ); // kill render loop
    this.removeListeners();

    // dispose all sprites on Display List

    let i = this.numChildren();

    while ( i-- ) {
        this._children[ i ].dispose();
    }
    this._children = [];

    if ( this._element.parentNode ) {
        this._element.parentNode.removeChild( this._element );
    }
    this._disposed = true;
};

/* event handlers */

/**
 * @protected
 * @param {Event} event
 */
Canvas.prototype.handleInteraction = function( event ) {
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

                const touches /** @type {TouchList} */ = event.changedTouches;
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
                let { offsetX, offsetY } = event;
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
                const { deltaX, deltaY } = event;
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
};

/* protected methods */

/**
 * the render loop drawing the Objects onto the Canvas, shouldn't be
 * invoked directly but by the animation loop or an update request
 *
 * @protected
 * @param {DOMHighResTimeStamp} now time elapsed since document time origin
 */
Canvas.prototype.render = function( now = 0 )
{
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
        updateCanvasSize( this );
    }

    const ctx = this._canvasContext;
    let theSprite;

    if ( ctx ) {

        const width  = this._width;
        const height = this._height;

        // clear previous canvas contents either by flooding it
        // with the optional background colour, or by clearing all pixel content

        if ( this._bgColor ) {
            ctx.fillStyle = this._bgColor;
            ctx.fillRect( 0, 0, width, height );
        }
        else {
            ctx.clearRect( 0, 0, width, height );
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
            theSprite.draw( ctx, this._viewport );
            theSprite = theSprite.next;
        }
    }

    // keep render loop going while Canvas is animatable

    if ( !this._disposed && this._animate ) {
        this._renderPending = true;
        this._renderId = window.requestAnimationFrame( this._renderHandler );
    }
};

/**
 * sprites have no HTML elements, the actual HTML listeners are
 * added onto the canvas, the Canvas will delegate events onto
 * the "children" of the canvas' Display List
 *
 * @protected
 */
Canvas.prototype.addListeners = function() {

    if ( !this._eventHandler ) {

        /**
         * @protected
         * @type {EventHandler}
         */
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
    theHandler.add( window, "mouseup", theListener ); // note different element in listener

    if ( this._viewport ) {
        theHandler.add( element, "wheel", theListener );
    }

    if ( this._stretchToFit ) {
        theHandler.add( window, "resize", () => {
            this.stretchToFit( this._stretchToFit );
        });
    }
};

/**
 * sprites have no HTML elements, the actual HTML listeners are
 * added onto the canvas, the Canvas will delegate events onto
 * the "children" of the canvas' Display List
 *
 * @protected
 */
Canvas.prototype.removeListeners = function() {
    if ( this._eventHandler ) {
        this._eventHandler.dispose();
    }
    this._eventHandler = null;
};

/**
 * get the position of this sprite's HTML element and
 * return its x and y coordinates
 *
 * @protected
 * @return {DOMRect}
 */
Canvas.prototype.getCoordinate = function() {
    if ( this._coords === null ) {
        // to prevent expensive repeated calls to this method
        // coords should be nulled upon canvas resize or DOM layout changes
        this._coords = this._element.getBoundingClientRect();
    }
    return this._coords;
};

/* internal methods */

/**
 * @private
 * @param {Canvas} canvasInstance
 */
function updateCanvasSize( canvasInstance ) {
    const scaleFactor = canvasInstance._HDPIscaleRatio;
    const viewport    = canvasInstance._viewport;
    let width, height;

    if ( canvasInstance._enqueuedSize ) {
        ({ width, height } = canvasInstance._enqueuedSize );
        canvasInstance._enqueuedSize = null;
        /** @protected @type {number} */ canvasInstance._width  = width;
        /** @protected @type {number} */ canvasInstance._height = height;
    }

    if ( viewport ) {
        const cvsWidth  = canvasInstance._width;
        const cvsHeight = canvasInstance._height;

        width  = min( viewport.width,  cvsWidth );
        height = min( viewport.height, cvsHeight );

        // in case viewport was panned beyond the new canvas dimensions
        // reset pan to center.
/*
        if ( viewport.left > cvsWidth ) {
            viewport.left  = cvsWidth * .5;
            viewport.right = viewport.width + viewport.left;
        }
        if ( viewport.top > cvsHeight ) {
            viewport.top    = cvsHeight * .5;
            viewport.bottom = viewport.height + viewport.top;
        }
*/
    }

    if ( width && height ) {
        const element = canvasInstance._element;

        element.width  = width  * scaleFactor;
        element.height = height * scaleFactor;

        element.style.width  = `${width}px`;
        element.style.height = `${height}px`;
    }
    canvasInstance._canvasContext.scale( scaleFactor, scaleFactor );

    // non-smoothing must be re-applied when the canvas dimensions change...

    if ( canvasInstance._smoothing === false ) {
        canvasInstance.setSmoothing( false );
    }
    canvasInstance._coords = null; // invalidate cached bounding box
}
