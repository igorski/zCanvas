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
define( "zCanvas", [ "helpers", "zSprite" ], function( helpers, zSprite )
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
     * @param {boolean=} aAnimateable whether we will animate the Canvas (redraw it constantly), this defaults
     *                   to false to preserve resources (and will only (re)draw when adding/removing
     *                   zSprites from the display list) set to true, when creating animated content
     * @param {number=}  aFrameRate desired framerate, defaults to 60 fps
     */
    var zCanvas = function( aWidth, aHeight, aAnimateable, aFrameRate )
    {
        if ( !aFrameRate ) {
            aFrameRate = 60;
        }
        this._fps            = aFrameRate;
        this._renderInterval = 1000 / aFrameRate;

        this._renderHandler  = helpers.bind( this.render, this );

        this._children = [];
        this._animate = aAnimateable || false;

        this._element       = /** @type {HTMLCanvasElement} */ ( document.createElement( "canvas" ));
        this._canvasContext = this._element[ "getContext" ]( "2d" );
        this.setDimensions( aWidth, aHeight );

        this.addListeners();

        if ( this._animate ) {
            this.render();  // starts render loop
        }
    };

    // inherit from parent disposable
    zCanvas.prototype = new helpers.Disposable();

    /* class properties */

    /** @private @type {HTMLCanvasElement} */        zCanvas.prototype._element;
    /** @private @type {number} */                   zCanvas.prototype._width;
    /** @private @type {number} */                   zCanvas.prototype._height;
    /** @private @type {CanvasRenderingContext2D} */ zCanvas.prototype._canvasContext;
    /** @private @type {helpers.EventHandler} */     zCanvas.prototype._eventHandler;
    /** @private @type {Array.<zSprite>} */     zCanvas.prototype._children;

    /** @private @type {boolean} */   zCanvas.prototype._disposed = false;
    /** @private @type {boolean} */   zCanvas.prototype._animate = false;
    /** @private @type {number} */    zCanvas.prototype._fps;
    /** @private @type {number} */    zCanvas.prototype._renderInterval;
    /** @private @type {number} */    zCanvas.prototype._lastRender = 0;
    /** @private @type {!Function} */ zCanvas.prototype._renderHandler;
    /** @private @type {number} */    zCanvas.prototype._renderId;
    /** @private @type {number} */    zCanvas.prototype._updateTimeout;

    /* public methods */

    /**
     * appends this zCanvas to the DOM (i.e. adds the references <canvas>-
     * element into the supplied container
     *
     * @public
     *
     * @param {Element} aContainer DOM node to append the zCanvas to
     */
    zCanvas.prototype.insertInPage = function( aContainer )
    {
        if ( this.getElement().parentNode )
            throw new Error( "zCanvas already present in DOM" );

        aContainer.appendChild( this.getElement());
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
            aChild.next      = null;
        }
        aChild.canvas = this;
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
        aChild.canvas = null;

        //aChild.dispose(); // no, we might like to re-use the child at a later stage ?

        var i = this._children.length;

        while ( i-- )
        {
            if ( this._children[ i ] == aChild )
            {
                this._children.splice( i, 1 );
                break;
            }
        }

        // update linked list
        var l = this._children.length;
        for ( i = 0; i < l; ++i )
        {
            var theSprite = this._children[ i ];

            if ( i > 0 )
            {
                var prevSprite  = this._children[ i - 1 ];
                theSprite.last  = prevSprite;
                prevSprite.next = theSprite;
            }
            else {
                theSprite.last = null;
            }

            if ( i == ( l - 1 ))
                theSprite.next = null;
        }

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
     */
    zCanvas.prototype.removeChildAt = function( index )
    {
        this.removeChild( this.getChildAt( index ));
    };

    /**
     * invoke when the state of the ZCanvas has changed (i.e.
     * the visual contents should change), this will invoke
     * a new render request (obsolete if the canvas is
     * continuously rendering due to being animatable)
     *
     * @public
     */
    zCanvas.prototype.invalidate = function()
    {
        // if the ZCanvas isn't updating, we make a
        // request for updating the contents

        if ( !this._animate )
        {
            this.update();
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

        var i = this._children.length;

        while ( i-- )
        {
            var theChild = this._children[ i ];

            var childX = theChild.getX(), childY = theChild.getY(),
                childWidth = theChild.getWidth(), childHeight = theChild.getHeight();

            if ( childX < aX + aWidth  && childX + childWidth > aX &&
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
        var i = this._children.length;

        while( i-- )
        {
            if ( this._children[ i ] == aChild )
            {
                return true;
            }
        }
        return false;
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
     * @return {number}
     */
    zCanvas.prototype.getRenderInterval = function()
    {
        return this._renderInterval;
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
        this._element[ "width" ]  = this._width  = aWidth;
        this._element[ "height" ] = this._height = aHeight;

        this.invalidate();
    };

    /**
     * @public
     * @return {boolean}
     */
    zCanvas.prototype.isAnimateable = function()
    {
        return this._animate;
    };

    /**
     * forces an update of the Canvas' contents, this will be omitted
     * when this is an animated zCanvas as the next render cycle
     * will auto-update the contents automatically
     *
     * @public
     */
    zCanvas.prototype.update = function()
    {
        if ( !this._animate )
        {
            // we add a short delay to make sure the update occurs on the
            // next render cycle of the BROWSER (overcomes blank screen
            // when this occurs during heavy asynchronous operations) for
            // this purpose a 0 ms delay suffices, but we up the delay
            // slightly because of :

            // a contribution by Igor Kogan : use the timeout as a proxy
            // and clear previous timeouts upon subsequent requests to
            // avoid a massive influx of render operations happening
            // in series during state change operations (i.e. lots of
            // add/remove children, etc.)

            clearTimeout( this._updateTimeout );
            this._updateTimeout = setTimeout( this._renderHandler, 5 );
        }
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
            var bitmap = ctx.getImageData( aX, aY, aWidth, aHeight );

            // Here we loop through the bitmap slice and its colors
            // (maximum four, each representing a channel in the RGBA spectrum)

            for ( var i = 0, l = ( aWidth * aHeight ) * 4; i < l; i += 4 )
            {
                var match = false;

                // check red value (if specified)

                if ( aRedValue !== null && aRedValue !== void 0 )
                {
                    match = ( bitmap.data[ i ] == aRedValue );
                    if ( !match ) return false;
                }

                // check green value (if specified)

                if ( aGreenValue !== null && aGreenValue !== void 0 )
                {
                    match = ( bitmap.data[ i + 1 ] == aGreenValue );
                    if ( !match ) return false;
                }

                // check blue value (if specified)

                if ( aBlueValue !== null && aBlueValue !== void 0 )
                {
                    match = ( bitmap.data[ i + 2 ] == aBlueValue );
                    if ( !match ) return false;
                }

                // check alpha value (if specified)

                if ( aAlphaValue !== null && aAlphaValue !== void 0 )
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
        var now   = +new Date();  // current timestamp
        var delta = now - this._lastRender;

        // only execute render when the time for a single frame
        // (at the requested framerate) has passed

        if ( delta > this._renderInterval )
        {
            this._lastRender = now - ( delta % this._renderInterval );
            var ctx = this._canvasContext;

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

            // clear previous canvas contents

            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.fillRect( 0, 0, this._width, this._height );

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
        // keep render loop going

        if ( !this._disposed && this._animate )
        {
            this._renderId = window[ "requestAnimationFrame" ]( this._renderHandler );
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
        window[ "cancelAnimationFrame" ]( this._renderId ); // kill render loop

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
        var numChildren  = this._children.length;
        var eventOffsetX = 0;
        var eventOffsetY = 0;

        if ( numChildren > 0 )
        {
            // reverse loop to first handle top layers
            var theChild = this._children[ numChildren - 1 ];

            switch ( aEvent.type )
            {
                // all touch events
                default:

                    var touches /** @type {TouchList} */  = aEvent.touches;

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
                        var found = theChild.handleInteraction( aEvent.offsetX, aEvent.offsetY, aEvent );

                        if ( found )
                            break;

                        theChild = theChild.last;
                    }
                    break;
            }
        }
        aEvent.stopPropagation();
        aEvent.preventDefault();

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
        var theListener = helpers.bind( this.handleInteraction, this );

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
});
