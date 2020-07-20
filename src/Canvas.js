/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2013-2020 - https://www.igorski.nl
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
import EventHandler from "./utils/EventHandler";
import OOP          from "./utils/OOP";

/**
 * creates an API for an HTMLCanvasElement where all drawables are treated as
 * self-contained Objects that can add/remove themselves from the DisplayList, rather
 * than having a single function aggregating all drawing instructions
 *
 * @constructor
 * @param {{
 *            width: number,
 *            height: number,
 *            fps: number,
 *            scale : number,
 *            backgroundColor: string,
 *            animate: boolean,
 *            smoothing: boolean,
 *            stretchToFit: boolean,
 *            preventEventBubbling: boolean,
 *            parentElement: null,
 *            onUpdate: Function,
 *            debug: boolean
 *        }}
 */
function Canvas({
    width = 300, height = 300, fps = 60, scale = 1, backgroundColor = null,
    animate = false, smoothing = true, stretchToFit = false,
    preventEventBubbling = false, parentElement = null, debug = false, onUpdate = null
} = {}) {

    if ( width <= 0 || height <= 0 ) {
        throw new Error( "cannot construct a zCanvas without valid dimensions" );
    }

    /* instance properties */

    /** @public @type {boolean} */     this.DEBUG           = debug;
    /** @protected @type {number} */   this._fps            = fps;
    /** @protected @type {boolean} */  this._animate        = animate;
    /** @protected @type {boolean} */  this._smoothing      = smoothing;
    /** @protected @type {Function} */ this._updateHandler  = onUpdate;
    /** @protected @type {Function} */ this._renderHandler  = this.render.bind( this );
    /** @protected @type {number} */   this._lastRender     = 0;
    /** @protected @type {number} */   this._renderId       = 0;
    /** @protected @type {boolean} */  this._renderPending  = false;
    /** @protected @type {number} */   this._renderInterval = 1000 / this._fps;
    /** @protected @type {boolean} */  this._disposed       = false;
    /** @protected @type {object} */   this._scale          = { x: scale, y: scale };

    /** @protected @type {Array<Sprite>} */ this._children = [];

    /* initialization */

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

    const devicePixelRatio  = window.devicePixelRatio || 1;
    const backingStoreRatio = this._canvasContext.webkitBackingStorePixelRatio ||
                                 this._canvasContext.mozBackingStorePixelRatio ||
                                  this._canvasContext.msBackingStorePixelRatio ||
                                   this._canvasContext.oBackingStorePixelRatio ||
                                    this._canvasContext.backingStorePixelRatio || 1;

    const ratio = devicePixelRatio / backingStoreRatio;

    /** @protected @type {number} */ this._HDPIscaleRatio = ( devicePixelRatio !== backingStoreRatio ) ? ratio : 1;

    this.setDimensions( width, height, true, true );

    if ( scale !== 1 ) {
        this.scale( scale, scale );
    }
    this.stretchToFit( stretchToFit );

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
 */
Canvas.extend = function( extendingFunction ) {
    OOP.extend( extendingFunction, Canvas );
};

/* public methods */

/**
 * appends this Canvas to the DOM (i.e. adds the references <canvas>-
 * element into the supplied container
 *
 * @public
 * @param {Element} aContainer DOM node to append the Canvas to
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
 * @override
 * @public
 *
 * @return {Element}
 */
Canvas.prototype.getElement = function() {

    return this._element;
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

    if ( this.contains( aChild ))
        return this;

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

    if ( prevChild )
        prevChild.next = nextChild;

    if ( nextChild )
        nextChild.last = prevChild;

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

    return this._children.indexOf( aChild ) > -1;
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
        if ( context[ prop ] !== undefined )
            context[ prop ] = enabled;
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
 * @param {number} aWidth
 * @param {number} aHeight
 * @param {boolean=} setAsPreferredDimensions optional, defaults to true, stretchToFit handler
 *        overrides this to ensure returning to correct dimensions when disabling stretchToFit
 * @param {boolean=} optImmediate optional, whether to apply immediately, defaults to false
 *        to prevent flickering of existing screen contents during repeated resize
 */
Canvas.prototype.setDimensions = function( aWidth, aHeight, setAsPreferredDimensions, optImmediate ) {
    /**
     * @protected
     * @type {{width: number, height: number}}
     */
    this._enqueuedSize = { "width": aWidth, "height": aHeight };

    if ( setAsPreferredDimensions !== false ) {
        /** @protected @type {number} */ this._preferredWidth  = aWidth;
        /** @protected @type {number} */ this._preferredHeight = aHeight;
    }

    if ( optImmediate === true ) {
        updateCanvasSize( this );
    }
    this.invalidate();
};

/**
 * set the background color for the Canvas, either hexadecimal
 * or RGB/RGBA, e.g. "#FF0000" or "rgba(255,0,0,1)";
 *
 * @public
 * @param {string} aColor
 */
Canvas.prototype.setBackgroundColor = function( aColor ) {
    /**
     * @protected
     * @type {string}
     */
    this._bgColor = aColor;
};

/**
 * @public
 * @param {boolean} value
 */
Canvas.prototype.setAnimatable = function( value ) {

    const oldValue = this._animate;
    this._animate  = value;

    if ( value && !oldValue && !this._renderPending )
        this._renderHandler();
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
 * @param {Image} aSource HTMLImageElement to draw
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

    // use 9-arity draw method if source rectangle is defined

    if ( typeof aOptSourceX === "number" ) {

        // clipping rectangle doesn't have to exceed <canvas> dimensions
        destWidth  = Math.min( this._canvasContext.canvas.width,  destWidth );
        destHeight = Math.min( this._canvasContext.canvas.height, destHeight );

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

        this._canvasContext.drawImage(
            aSource,
            // no rounding required here as these are integer values
            aOptSourceX, aOptSourceY, aOptSourceWidth, aOptSourceHeight,
            // but we do round the target coordinates
            destX, destY, destWidth, destHeight
        );
    }
    else {
        this._canvasContext.drawImage( aSource, destX, destY, destWidth, destHeight );
    }
};

/**
 * Scales the canvas accordingly. This can be used to render content at a lower
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

    if ( this._stretchToFit ) {
        this.stretchToFit( true, this._maintainRatio );
    }
};

/**
 * Stretches the Canvas to fit inside the available window size
 * NOTE: when maintaing the aspect ratio this is not equal to filling the entire window size
 * when the canvas dimensions re of a different ratio than the window, instead the dominant
 * side will be scaled to fit. This method will maintain the existing scale factor.
 *
 * @public
 * @param {boolean=} value whether to stretch the canvas to fit the window size
 * @param {boolean=} maintainRatio whether to maintain the current aspect ratio
 */
Canvas.prototype.stretchToFit = function( value, maintainRatio = false ) {
    /**
     * @protected
     * @type {boolean}
     */
    this._stretchToFit = value;

    /**
     * @protected
     * @type {boolean}
     */
    this._maintainRatio = maintainRatio;

    const idealWidth   = this._preferredWidth;
    const idealHeight  = this._preferredHeight;
    const { x, y }     = this._scale; // take existing canvas scale factor into account

    const { innerWidth, innerHeight } = window;

    let targetWidth, targetHeight;
    if ( maintainRatio && value ) {
        const ratio  = Math.min( innerWidth / idealWidth, innerHeight / idealHeight );
        targetWidth  = idealWidth * ratio;
        targetHeight = idealHeight * ratio;
    } else {
        targetWidth  = value ? ( innerWidth  / x ) : idealWidth;
        targetHeight = value ? ( innerHeight / y ) : idealHeight;
    }
    this.setDimensions( Math.round( targetWidth ), Math.round( targetHeight ), false );
};

/**
 * @public
 */
Canvas.prototype.dispose = function() {

    if ( this._disposed )
        return;

    this._disposed = true;
    this.removeListeners();
    this._animate = false;
    window.cancelAnimationFrame( this._renderId ); // kill render loop

    // dispose all sprites on Display List

    let i = this.numChildren();

    while ( i-- ) {
        this._children[ i ].dispose();
    }
    this._children = [];
};

/* event handlers */

/**
 * @protected
 * @param {Event} aEvent
 */
Canvas.prototype.handleInteraction = function( aEvent ) {

    const numChildren  = this._children.length;
    let theChild, touches, found;

    if ( numChildren > 0 ) {

        // reverse loop to first handle top layers
        theChild = this._children[ numChildren - 1 ];

        switch ( aEvent.type ) {

            // all touch events
            default:
                let eventOffsetX = 0, eventOffsetY = 0;
                touches /** @type {TouchList} */ = ( aEvent.touches.length > 0 ) ? aEvent.touches : aEvent.changedTouches;

                if ( touches.length > 0 ) {
                    const offset = this.getCoordinate();

                    eventOffsetX = touches[ 0 ].pageX - offset.x;
                    eventOffsetY = touches[ 0 ].pageY - offset.y;
                }

                while ( theChild ) {
                    theChild.handleInteraction( eventOffsetX, eventOffsetY, aEvent );
                    theChild = theChild.last; // note we don't break this loop for multi touch purposes
                }
                break;

            // all mouse events
            case "mousedown":
            case "mousemove":
            case "mouseup":
                const { offsetX, offsetY } = aEvent;
                while ( theChild ) {
                    found = theChild.handleInteraction( offsetX, offsetY, aEvent );
                    if ( found ) {
                        break;
                    }
                    theChild = theChild.last;
                }
                break;
        }
    }
    if ( this._preventDefaults ) {
        aEvent.stopPropagation();
        aEvent.preventDefault();
    }
    // update the Canvas contents
    this.invalidate();
};

/* protected methods */

/**
 * the render loop drawing the Objects onto the Canvas, shouldn't be
 * invoked directly but by the animation loop or an update request
 *
 * @protected
 */
Canvas.prototype.render = function() {
    const now   = Date.now();  // current timestamp
    const delta = now - this._lastRender;

    this._renderPending = false;
    this._lastRender    = now - ( delta % this._renderInterval );

    // in case a resize was requested execute it now as we will
    // immediately draw nwe contents onto the screen

    if ( this._enqueuedSize ) {
        updateCanvasSize( this );
    }

    const ctx = this._canvasContext;
    let theSprite;

    if ( ctx ) {

        // clear previous canvas contents either by flooding it
        // with the optional background colour, or by clearing all pixel content

        if ( this._bgColor ) {
            ctx.fillStyle = this._bgColor;
            ctx.fillRect( 0, 0, this._width, this._height );
        }
        else {
            ctx.clearRect( 0, 0, this._width, this._height );
        }

        const useExternalUpdateHandler = ( typeof this._updateHandler === "function" );

        if ( useExternalUpdateHandler ) {
            this._updateHandler( now );
        }

        // draw the children onto the canvas

        if ( this._children.length > 0 ) {

            theSprite = this._children[ 0 ];

            while ( theSprite ) {

                if ( !useExternalUpdateHandler ) {
                    theSprite.update( now );
                }
                theSprite.draw( ctx );
                theSprite = theSprite.next;
            }
        }
    }

    // keep render loop going if Canvas is animatable

    if ( !this._disposed && this._animate && !this._renderPending ) {
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

    const theListener = this.handleInteraction.bind( this );

    // use touch events ?

    if ( !!( "ontouchstart" in window )) {
        this._eventHandler.addEventListener( this._element, "touchstart", theListener );
        this._eventHandler.addEventListener( this._element, "touchmove",  theListener );
        this._eventHandler.addEventListener( this._element, "touchend",   theListener );
    }

    this._eventHandler.addEventListener( this._element, "mousedown", theListener );
    this._eventHandler.addEventListener( this._element, "mousemove", theListener );
    this._eventHandler.addEventListener( window,        "mouseup",   theListener ); // yes, window!

    if ( this._stretchToFit ) {
        const resizeEvent = "onorientationchange" in window ? "orientationchange" : "resize";
        this._eventHandler.addEventListener( window, resizeEvent, () => {
            this.stretchToFit( this._stretchToFit, this._maintainRatio );
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
 * @return {Object} w/ x and y properties
 */
Canvas.prototype.getCoordinate = function() {

    let left = 0;
    let top  = 0;
    let theElement = this._element;

    while ( theElement.offsetParent ) {

        left      += theElement.offsetLeft;
        top       += theElement.offsetTop;
        theElement = theElement.offsetParent;
    }
    left += theElement.offsetLeft;
    top  += theElement.offsetTop;

    return { "x" : left, "y" : top };
};

/* internal methods */

/**
 * @private
 * @param {Canvas} canvasInstance
 */
function updateCanvasSize( canvasInstance ) {

    // apply scale factor for HDPI screens
    const scaleFactor = canvasInstance._HDPIscaleRatio;

    const width  = canvasInstance._enqueuedSize.width,
          height = canvasInstance._enqueuedSize.height;

    canvasInstance._enqueuedSize = null;

    /** @protected @type {number} */ canvasInstance._width  = width;
    /** @protected @type {number} */ canvasInstance._height = height;

    canvasInstance._element.width  = width  * scaleFactor;
    canvasInstance._element.height = height * scaleFactor;

    canvasInstance._element.style.width  = width  + "px";
    canvasInstance._element.style.height = height + "px";

    canvasInstance._canvasContext.scale( scaleFactor, scaleFactor );

    // non-smoothing must be re-applied when the canvas dimensions change...

    if ( canvasInstance._smoothing === false )
        canvasInstance.setSmoothing( canvasInstance._smoothing );
}
