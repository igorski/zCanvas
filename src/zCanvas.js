/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2010-2014 Igor Zinken / igorski
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
"use strict";

// resolve CommonJS dependencies

if ( typeof module !== "undefined" )
{
    var helpers = require( "./helpers" );
}

(function( aName, aModule )
{
    // CommonJS
    if ( typeof module !== "undefined" )
        module.exports = aModule();

    // AMD
    else if ( typeof define === "function" && typeof define.amd === "object" )
        define( aName, [ "helpers", "zSprite" ], function( helpers, zSprite ) { return aModule(); });

    // Browser global
    else this[ aName ] = aModule;

}( "zCanvas", function()
{
    "use strict";

    /**
     * creates an API for a HTML Canvas similar to the Flash Stage Object
     * its "children" are zCanvass which can be "added" and "removed"
     * from a DisplayList. Each child is drawn onto the canvas on each render cycle
     *
     * @constructor
     * @extends {helpers.Disposable}
     *
     * @param {number}   aWidth desired canvas width
     * @param {number}   aHeight desired canvas height
     * @param {boolean=} aAnimatable whether we will animate the Canvas (redraw it constantly), this defaults
     *                   to false to preserve resources (and will only (re)draw when adding/removing
     *                   zSprites from the display list) set to true, when creating animated content
     * @param {number=}  aFrameRate desired framerate, defaults to 60 fps
     */
    var zCanvas = function( aWidth, aHeight, aAnimatable, aFrameRate )
    {
        if ( typeof aWidth  !== "number" || aWidth <= 0 ||
             typeof aHeight !== "number" || aHeight <= 0 )
        {
            throw new Error( "cannot construct a zCanvas without valid dimensions" );
        }

        if ( typeof aFrameRate !== "number" ) {
            aFrameRate = 60;
        }
        this._fps            = aFrameRate;
        this._renderInterval = 1000 / aFrameRate;
        this._renderHandler  = this.render.bind( this );

        this._children = [];
        this._animate  = ( typeof aAnimatable === "boolean" ) ? aAnimatable : false;

        this._element = /** @type {HTMLCanvasElement} */ ( document.createElement( "canvas" ));
        var context   = this._element.getContext( "2d" );

        // ensure all is crisp clear on HDPI screens

        var devicePixelRatio  = window.devicePixelRatio || 1;
        var backingStoreRatio = context.webkitBackingStorePixelRatio ||
                                   context.mozBackingStorePixelRatio ||
                                    context.msBackingStorePixelRatio ||
                                     context.oBackingStorePixelRatio ||
                                      context.backingStorePixelRatio || 1;

        var ratio = devicePixelRatio / backingStoreRatio;

        this._HDPIscaleRatio = ( devicePixelRatio !== backingStoreRatio ) ? ratio : 1;
        this._canvasContext  = context;

        this.setDimensions( aWidth, aHeight );
        this.addListeners();

        if ( this._animate ) {
            this.render();  // start render loop
        }
    };

    // inherit prototype properties of Disposable
    helpers.extend( zCanvas, helpers.Disposable );

    /**
     * extend a given Function reference with the zCanvas prototype, you
     * can use this to create custom zCanvas extensions. From the extensions
     * you can call:
     *
     * InheritingPrototype.super( extensionInstance, methodName, var_args...)
     *
     * to call zCanvas prototype functions from overriding function declarations
     * if you want to call the constructor, methodName is "constructor"
     *
     * @public
     * @param {!Function} extendingFunction reference to
     *        function which should inherit the zCanvas prototype
     */
    zCanvas.extend = function( extendingFunction )
    {
        helpers.extend( extendingFunction, zCanvas );
    };

    /* instance properties */

    /** @public @type {boolean} */                   zCanvas.prototype.DEBUG = false; // whether to draw zSprite bounds
    /** @private @type {HTMLCanvasElement} */        zCanvas.prototype._element;
    /** @private @type {number} */                   zCanvas.prototype._width;
    /** @private @type {number} */                   zCanvas.prototype._height;
    /** @private @type {string} */                   zCanvas.prototype._bgColor;
    /** @private @type {CanvasRenderingContext2D} */ zCanvas.prototype._canvasContext;
    /** @private @type {helpers.EventHandler} */     zCanvas.prototype._eventHandler;
    /** @private @type {Array.<zSprite>} */          zCanvas.prototype._children;

    /** @private @type {boolean} */   zCanvas.prototype._disposed        = false;
    /** @private @type {boolean} */   zCanvas.prototype._animate         = false;
    /** @private @type {boolean} */   zCanvas.prototype._smoothing       = true;
    /** @private @type {boolean} */   zCanvas.prototype._HDPIscaleRatio  = 1;
    /** @private @type {boolean} */   zCanvas.prototype._preventDefaults = false;
    /** @private @type {number} */    zCanvas.prototype._fps;
    /** @private @type {number} */    zCanvas.prototype._renderInterval;
    /** @private @type {number} */    zCanvas.prototype._lastRender = 0;
    /** @private @type {!Function} */ zCanvas.prototype._renderHandler;
    /** @private @type {number} */    zCanvas.prototype._renderId;
    /** @private @type {boolean} */   zCanvas.prototype._renderPending = false;

    /* public methods */

    /**
     * appends this zCanvas to the DOM (i.e. adds the references <canvas>-
     * element into the supplied container
     *
     * @public
     * @param {Element} aContainer DOM node to append the zCanvas to
     */
    zCanvas.prototype.insertInPage = function( aContainer )
    {
        if ( this.getElement().parentNode )
            throw new Error( "zCanvas already present in DOM" );

        aContainer.appendChild( this.getElement());
    };

    /**
     * whether or not all events captured by the zCanvas can
     * bubble down in the document, when true, DOM events that
     * have interacted with the zCanvas will stop their propagation
     * and prevent their default behaviour
     *
     * @public
     * @param {boolean} value
     */
    zCanvas.prototype.preventEventBubbling = function( value )
    {
        this._preventDefaults = value;
    };

    /**
     * get the <canvas>-element inside the DOM that is used
     * to render this zCanvas' contents
     *
     * @override
     * @public
     *
     * @return {Element}
     */
    zCanvas.prototype.getElement = function()
    {
        return this._element;
    };

    /**
     * @public
     * @param {zSprite} aChild
     *
     * @return {zCanvas} this zCanvas - for chaining purposes
     */
    zCanvas.prototype.addChild = function( aChild )
    {
        // create a linked list
        var numChildren = this._children.length;

        if ( numChildren > 0 )
        {
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
     * @param {zSprite} aChild the child to remove from this zCanvas
     *
     * @return {zSprite} the removed child - for chaining purposes
     */
    zCanvas.prototype.removeChild = function( aChild )
    {
        aChild.setParent( null );
        aChild.setCanvas( null );

        //aChild.dispose(); // no, we might like to re-use the child at a later stage!

        var childIndex = this._children.indexOf( aChild );
        if ( childIndex !== -1 ) {
            this._children.splice( childIndex, 1 );
        }

        // update linked list

        var prevChild = aChild.last;
        var nextChild = aChild.next;

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
     * retrieve a child of this zCanvas by its index in the Display List
     *
     * @public
     *
     * @param {number} index of the object in the Display List
     * @return {zSprite} the referenced object
     */
    zCanvas.prototype.getChildAt = function( index )
    {
        return this._children[ index ];
    };

    /**
     * remove a child from this zCanvas' Display List at the given index
     *
     * @public
     * @param {number} index of the object to remove
     * @return {zSprite} the removed zSprite
     */
    zCanvas.prototype.removeChildAt = function( index )
    {
        return this.removeChild( this.getChildAt( index ));
    };

    /**
     * @public
     * @return {number} the amount of children in this object's Display List
     */
    zCanvas.prototype.numChildren = function()
    {
        return this._children.length;
    };

    /**
     * check whether a given display object is present in this object's display list
     *
     * @public
     * @param {zSprite} aChild
     *
     * @return {boolean}
     */
    zCanvas.prototype.contains = function( aChild )
    {
        return this._children.indexOf( aChild ) > -1;
    };

    /**
     * invoke when the state of the zCanvas has changed (i.e.
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
    zCanvas.prototype.invalidate = function()
    {
        if ( !this._animate && !this._renderPending )
        {
            this._renderPending = true;
            this._renderId = window.requestAnimationFrame( this._renderHandler );
        }
    };

    /**
     * retrieve all children of this zCanvas that are currently residing at
     * a given coordinate and rectangle, can be used in conjunction with zSprite
     * "collidesWith"-method to query only the objects that are in its vicinity, greatly
     * freeing up CPU resources by not checking against out of bounds objects
     *
     * @public
     *
     * @param {number} aX x-coordinate
     * @param {number} aY y-coordinate
     * @param {number} aWidth rectangle width
     * @param {number} aHeight rectangle height
     * @param {boolean=} aOnlyCollidables optionally only return children that are collidable defaults to false
     *
     * @return {Array.<zSprite>}
     */
    zCanvas.prototype.getChildrenUnderPoint = function( aX, aY, aWidth, aHeight, aOnlyCollidables )
    {
        var out = [];

        var i = this._children.length, theChild, childX, childY, childWidth, childHeight;

        while ( i-- )
        {
            theChild = this._children[ i ];

            childX      = theChild.getX();
            childY      = theChild.getY();
            childWidth  = theChild.getWidth();
            childHeight = theChild.getHeight();

            if ( childX < aX + aWidth  && childX + childWidth  > aX &&
                 childY < aY + aHeight && childY + childHeight > aY )
            {
                if ( !aOnlyCollidables || ( aOnlyCollidables && theChild.collidable )) {
                    out.push( theChild );
                }
            }
        }
        return out;
    };

    /**
     * @public
     * @return {Array.<zSprite>}
     */
    zCanvas.prototype.getChildren = function()
    {
        return this._children;
    };

    /**
     * return the framerate of the zCanvas, can be queried by
     * child zSprites to calculate strictly timed animated operations
     *
     * @public
     * @return {number}
     */
    zCanvas.prototype.getFrameRate = function()
    {
        return this._fps;
    };

    /**
     * retrieve the render interval for this zCanvas, this basically
     * describes the elapsed time in milliseconds between each successive
     * render at the current framerate
     *
     * @public
     * @return {number}
     */
    zCanvas.prototype.getRenderInterval = function()
    {
        return this._renderInterval;
    };

    /**
     * toggle the smoothing of the Canvas' contents.
     * for pixel art-type graphics, setting the smoothing to
     * false will yield crisper results
     *
     * @public
     * @param {boolean} aValue
     */
    zCanvas.prototype.setSmoothing = function( aValue )
    {
        var props = [ "imageSmoothingEnabled",  "mozImageSmoothingEnabled",
                      "oImageSmoothingEnabled", "webkitImageSmoothingEnabled" ];

        var ctx = this._canvasContext;

        this._smoothing = aValue;

        // observed not to work during setup

        window.requestAnimationFrame( function()
        {
            props.forEach( function( prop )
            {
                if ( ctx[ prop ] !== undefined )
                    ctx[ prop ] = aValue;
            });
        });
    };

    /**
     * @public
     * @return {number}
     */
    zCanvas.prototype.getWidth = function()
    {
        return this._width;
    };

    /**
     * @public
     * @return {number}
     */
    zCanvas.prototype.getHeight = function()
    {
        return this._height;
    };

    /**
     * updates the dimensions of the zCanvas
     *
     * @public
     *
     * @param {number} aWidth
     * @param {number} aHeight
     */
    zCanvas.prototype.setDimensions = function( aWidth, aHeight )
    {
        // apply scale factor for HDPI screens
        var scaleFactor = this._HDPIscaleRatio;

        this._width  = aWidth;
        this._height = aHeight;

        this._element.width  = aWidth  * scaleFactor;
        this._element.height = aHeight * scaleFactor;

        this._element.style.width  = aWidth  + "px";
        this._element.style.height = aHeight + "px";

        this._canvasContext.scale( scaleFactor, scaleFactor );

        // non-smoothing must be re-applied when the canvas dimensions change...

        if ( this._smoothing === false ) {
            this.setSmoothing( this._smoothing );
        }
        this.invalidate();
    };

    /**
     * set the background color for the zCanvas, either hexadecimal
     * or RGB/RGBA, e.g. "#FF0000" or "rgba(255,0,0,1)";
     *
     * @public
     * @param {string} aColor
     */
    zCanvas.prototype.setBackgroundColor = function( aColor )
    {
        this._bgColor = aColor;
    };

    /**
     * @public
     * @param {boolean} value
     */
    zCanvas.prototype.setAnimatable = function( value )
    {
        var oldValue = this._animate;

        this._animate = value;

        if ( value && !oldValue )
        {
            this._renderHandler();
        }
    };

    /**
     * @public
     * @return {boolean}
     */
    zCanvas.prototype.isAnimatable = function()
    {
        return this._animate;
    };

    /**
     * high precision pixel-based collision detection, can be queried to check whether the given
     * zSprite collides with another drawable object. By supplying specific RGBA values it is
     * possible to check for collision with a specific object as long as its colour is unique
     * (for instance a fully black "wall" (R = 0, G = 0, B = 0) or a purple "bullet"
     * (R = 255, G = 0, B = 128), etc. Note this method requires more from the CPU than
     * simply checking overlapping bounding boxes (see zSprite "collidesWith"-method).
     *
     * NOTE : invoke this in "update"-method of a zSprite as this requires existing pixel data
     * being onscreen !
     *
     * @public
     *
     * @param {zSprite} aSprite to check collisions for
     * @param {number|null=} aRedValue optional value between 0 - 255 the red channel must hold
     * @param {number|null=} aGreenValue optional value between 0 - 255 the green channel must hold
     * @param {number|null=} aBlueValue optional value between 0 - 255 the blue channel must hold
     * @param {number|null=} aAlphaValue optional value between 0 - 255 the alpha channel must hold
     * @param {number=} aX optional x-coordinate of the collision, defaults to current x of given sprite
     * @param {number=} aY optional y-coordinate of the collision, defaults to current y of given sprite
     * @param {number=} aWidth optional width of the collision rectangle, will default
     *                  to one pixel (will check one pixel to the left of given sprite and
     *                  one pixel on the right side of given sprite)
     * @param {number=} aHeight optional height of the collision rectangle, will default
     *                  to one pixel (will check one pixel above given sprite and one
     *                  pixel below given sprite)
     *
     * @return {number} 0 = no collision, 1 = horizontal collision, 2 = vertical collision, 3 = horizontal and vertical collisions
     */
    zCanvas.prototype.checkCollision = function( aSprite, aRedValue, aGreenValue, aBlueValue, aAlphaValue,
                                                 aX, aY, aWidth, aHeight )
    {
        aX = aX || aSprite.getX();
        aY = aY || aSprite.getY();

        aWidth  = aWidth  || 1;
        aHeight = aHeight || 1;

        var spriteWidth  = aSprite.getWidth();
        var spriteHeight = aSprite.getHeight();
        var ctx          = this._canvasContext;

        // the inner collision check

        var internalCheck = function( aX, aY, aWidth, aHeight )
        {
            var bitmap = ctx.getImageData( aX, aY, aWidth, aHeight), match;

            // Here we loop through the bitmap slice and its colors
            // (maximum four, each representing a channel in the RGBA spectrum)

            for ( var i = 0, l = ( aWidth * aHeight ) * 4; i < l; i += 4 )
            {
                match = false;

                // check red value (if specified)

                if ( typeof aRedValue === "number" )
                {
                    match = ( bitmap.data[ i ] == aRedValue );
                    if ( !match ) return false;
                }

                // check green value (if specified)

                if ( typeof aGreenValue === "number" )
                {
                    match = ( bitmap.data[ i + 1 ] == aGreenValue );
                    if ( !match ) return false;
                }

                // check blue value (if specified)

                if ( typeof aBlueValue === "number" )
                {
                    match = ( bitmap.data[ i + 2 ] == aBlueValue );
                    if ( !match ) return false;
                }

                // check alpha value (if specified)

                if ( typeof aAlphaValue === "number" )
                {
                    match = ( bitmap.data[ i + 3 ] == aAlphaValue );
                    if ( !match ) return false;
                }

                if ( match )
                    return true;
            }
            return false;
        };

        var horizontalCollision, verticalCollision;

        // check 1 : to the left
        horizontalCollision = internalCheck( aX - aWidth, aY, aWidth, spriteHeight );

        // check 2 : below
        verticalCollision = internalCheck( aX, aY + spriteHeight + aHeight, spriteWidth, aHeight );

        // check 3: to the right
        if ( !horizontalCollision )
            horizontalCollision = internalCheck( aX + spriteWidth + aWidth, aY, aWidth, spriteHeight );

        // check 4 : above
        if ( !verticalCollision )
            verticalCollision = internalCheck( aX, aY - aHeight, spriteWidth, aHeight );

        if ( !horizontalCollision && !verticalCollision )
            return 0;

        if ( horizontalCollision )
        {
            if ( verticalCollision )
                return 3;

            return 1;
        }
        return 2;
    };

    /* protected methods */

    /**
     * the render loop drawing the Objects onto the Canvas, shouldn't be
     * invoked directly but by the animation loop or an update request
     *
     * @protected
     */
    zCanvas.prototype.render = function()
    {
        var now   = Date.now();  // current timestamp
        var delta = now - this._lastRender;

        this._renderPending = false;

        // only execute render when the time for a single frame
        // (at the requested framerate) has passed

        if ( delta > this._renderInterval )
        {
            this._lastRender = now - ( delta % this._renderInterval );

            if ( this._children.length > 0 )
            {
                // update all child sprites
                var theSprite = this._children[ 0 ];

                while ( theSprite )
                {
                    theSprite.update( now );
                    theSprite = theSprite.next;
                }
            }

            var ctx = this._canvasContext;

            if ( ctx )
            {
                // clear previous canvas contents either by flooding it
                // with the optional background colour, or by clearing all pixel content

                if ( this._bgColor ) {
                    ctx.fillStyle = this._bgColor;
                    ctx.fillRect( 0, 0, this._width, this._height );
                }
                else {
                    ctx.clearRect( 0, 0, this._width, this._height );
                }

                // draw the children onto the canvas

                if ( this._children.length > 0 )
                {
                    theSprite = this._children[ 0 ];

                    while ( theSprite )
                    {
                        theSprite.draw( ctx );
                        theSprite = theSprite.next;
                    }
                }
            }
        }
        // keep render loop going

        if ( !this._disposed && this._animate )
        {
            this._renderPending = true;
            this._renderId = window.requestAnimationFrame( this._renderHandler );
        }
    };

    /**
     * @override
     * @protected
     */
    zCanvas.prototype.disposeInternal = function()
    {
        this.removeListeners();

        this._animate = false;
        window.cancelAnimationFrame( this._renderId ); // kill render loop

        // dispose all sprites on Display List

        var i = this.numChildren();

        while ( i-- )
        {
            this._children[ i ].dispose();
        }
        this._children = [];
    };

    /* event handlers */

    /**
     * @private
     * @param {Event} aEvent
     */
    zCanvas.prototype.handleInteraction = function( aEvent )
    {
        var numChildren  = this._children.length, theChild;
        var eventOffsetX = 0, eventOffsetY = 0;
        var touches, found;

        if ( numChildren > 0 )
        {
            // reverse loop to first handle top layers
            theChild = this._children[ numChildren - 1 ];

            switch ( aEvent.type )
            {
                // all touch events
                default:

                    touches /** @type {TouchList} */ = ( aEvent.touches.length > 0 ) ? aEvent.touches : aEvent.changedTouches;

                    if ( touches.length > 0 )
                    {
                        var offset = this.getCoordinate();

                        eventOffsetX = touches[ 0 ].pageX - offset.x;
                        eventOffsetY = touches[ 0 ].pageY - offset.y;
                    }

                    while ( theChild )
                    {
                        theChild.handleInteraction( eventOffsetX, eventOffsetY, aEvent );
                        theChild = theChild.last; // note we don't break this loop for multi touch purposes
                    }
                    break;

                // all mouse events
                case "mousedown":
                case "mousemove":
                case "mouseup":

                    while ( theChild )
                    {
                        found = theChild.handleInteraction( aEvent.offsetX, aEvent.offsetY, aEvent );

                        if ( found )
                            break;

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

    /* private methods */

    /**
     * zSprites have no HTML elements, the actual HTML listeners are
     * added onto the canvas, the zCanvas will delegate events onto
     * the "children" of the canvas' Display List
     *
     * @private
     */
    zCanvas.prototype.addListeners = function()
    {
        var theHandler  = this.getHandler();
        var theListener = this.handleInteraction.bind( this );

        // use touch events ?

        if ( !!( "ontouchstart" in window ))
        {
            theHandler.addEventListener( this._element, "touchstart", theListener );
            theHandler.addEventListener( this._element, "touchmove",  theListener );
            theHandler.addEventListener( this._element, "touchend",   theListener );
        }
        else {
            // nope, use mouse events
            theHandler.addEventListener( this._element, "mousedown", theListener );
            theHandler.addEventListener( this._element, "mousemove", theListener );
            theHandler.addEventListener( window,        "mouseup",   theListener );   // yes, window!
        }
    };

    /**
     * zSprites have no HTML elements, the actual HTML listeners are
     * added onto the canvas, the zCanvas will delegate events onto
     * the "children" of the canvas' Display List
     *
     * @private
     */
    zCanvas.prototype.removeListeners = function()
    {
        if ( this._eventHandler )
        {
            this._eventHandler.dispose();
        }
    };

    /**
     * @private
     * @returns {helpers.EventHandler}
     */
    zCanvas.prototype.getHandler = function()
    {
        return ( this._eventHandler ) ? this._eventHandler  : ( this._eventHandler = new helpers.EventHandler());
    };

    /**
     * @private
     * get the position of this sprite's HTML element and
     * return its x and y coordinates
     *
     * @return {Object} w/ x and y properties
     */
    zCanvas.prototype.getCoordinate = function()
    {
        var left = 0;
        var top  = 0;

        var theElement = this._element;

        while ( theElement.offsetParent )
        {
            left      += theElement.offsetLeft;
            top       += theElement.offsetTop;
            theElement = theElement.offsetParent;
        }
        left += theElement.offsetLeft;
        top  += theElement.offsetTop;

        return { "x" : left, "y" : top };
    };

    return zCanvas;

}));
