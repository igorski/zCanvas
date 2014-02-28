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
var zgor = zgor || {};

/**
 * provides an API equivalent to the Flash Sprite / Display Object for manipulating "Objects" on a canvas element.
 * extends a basic EventTarget for dispatching events, delegated by the zCanvas
 *
 * inheriting classes should override the public "draw"-method which is used for drawing the
 * sprite's visual representation onto the zCanvas. This method is invoked on each draw cycle.
 *
 * @constructor
 * @extends {util.Disposable}
 *
 * @param {number}        aXPos initial X position of this sprite
 * @param {number}        aYPos initial X position of this sprite
 * @param {number}        aWidth width of this sprite
 * @param {number}        aHeight width of this sprite
 * @param {Image|string=} aImageSource optional image, when passed, no override of the "draw"-method is required, as
 *                        it will draw the image. Can be either HTMLImageElement or base64 encoded string
 */
zgor.ZSprite = function( aXPos, aYPos, aWidth, aHeight, aImageSource )
{
    if ( aImageSource )
    {
        if ( aImageSource instanceof Image )
        {
            this._image = aImageSource;
        }
        else {
            this._image     = new Image();
            this._image.src = aImageSource;
        }
    }
    this.bounds    = { "left" : aXPos, "top" : aYPos, "width" : aWidth, "height" : aHeight };
    this._children = [];
};

// inherit from parent Disposable
zgor.ZSprite.prototype = new util.Disposable();

/* class variables */

/**
 * rectangle describing this Objects bounds
 * relative to the Canvas
 *
 * @protected
 * @type {Object} w/properties left, top, width, height
 */
zgor.ZSprite.prototype.bounds;

/**
 * @protected
 * stores a reference to the containing zSprite
 * @type {zgor.ZSprite}
 */
zgor.ZSprite.prototype._parent = null;

/**
 * @protected
 *
 * whether dispatched events must traverse via this Sprites
 * parent(s) through the "display list"
 *
 * @type {boolean}
  */
zgor.ZSprite.prototype._useEventBubbling = false;

/**
 * @protected
 * @type {Image}
 */
zgor.ZSprite.prototype._image;

/**
 * @private
 * @type {boolean}
 */
zgor.ZSprite.prototype._draggable = false;

/**
 * @private
 * @type {boolean}
 */
zgor.ZSprite.prototype._keepInBounds = false;

/**
 * @public
 * @type {boolean}
 */
zgor.ZSprite.prototype.isDragging = false;

/**
 * timestamp of the moment drag was enabled, used for
 * determining on release whether interaction was actually a tap/click
 *
 * @protected
 * @type {number}
 */
zgor.ZSprite.prototype._dragStartTime = 0;

/**
 * the coordinates of the click/touch event at the moment
 * drag was enabled
 *
 * @protected
 * @type {Object} w/ properties x and y
 */
zgor.ZSprite.prototype._dragStartEventCoordinates;

/**
 * this Sprites coordinates at the moment drag was enabled
 *
 * @protected
 * @type {Object} w/ properties x and y
 */
zgor.ZSprite.prototype._dragStartOffset;

/**
 * we use a linked list to quickly traverse the DisplayList
 * of the zCanvas
 *
 * @public
 * @type {zgor.ZSprite|null}
 */
zgor.ZSprite.prototype.last;

/**
 * we use a linked list to quickly traverse the DisplayList
 * of the zCanvas
 *
 * @public
 * @type {zgor.ZSprite|null}
 */
zgor.ZSprite.prototype.next;

/**
 * reference to the zCanvas holding this zSprite
 *
 * @public
 * @type {zgor.zCanvas}
 */
zgor.ZSprite.prototype.zCanvas;

/* public methods */

/**
 * @public
 * @param {CanvasRenderingContext2D} aCanvasContext
 */
zgor.ZSprite.prototype.draw = function( aCanvasContext )
{
    // extend in subclass if you're drawing a custom object instead of a graphical asset, don't
    // forget to invoke the super call for drawing the child display list !

    if ( this._image )
    {
        var bounds = this.bounds;

        aCanvasContext.drawImage( this._image,
                                  /** @type {number} */ ( bounds.left ),
                                  /** @type {number} */ ( bounds.top ),
                                  /** @type {number} */ ( bounds.width ),
                                  /** @type {number} */ ( bounds.height ));
    }
    // draw the children onto the canvas
    if ( this._children.length > 0 )
    {
        var theSprite = this._children[ 0 ];

        while ( theSprite )
        {
            theSprite.update();
            theSprite.draw( aCanvasContext );

            theSprite = theSprite.next;
        }
    }
};

/**
 * toggle the draggable mode of this zSprite
 *
 * @public
 *
 * @param {boolean} aValue whether we want to activate / deactivate the dragging mode
 * @param {boolean=} aKeepInBounds optional, whether we should keep dragging within bounds
 */
zgor.ZSprite.prototype.setDraggable = function( aValue, aKeepInBounds )
{
    this._draggable    = aValue;
    this._keepInBounds = aKeepInBounds || false;
};

/**
 * invoked on each render cycle before the draw-method
 * is invoked, you can override this in your subclass
 * for custom logic / animation
 *
 * @public
 */
zgor.ZSprite.prototype.update = function()
{
    // just an example, override

    /*
    if ( this.isDragging )
        return;

    var time = +new Date() * 0.002;

    this.setX( Math.sin( time ) * 96 + this.bounds.width );
    this.setY( Math.cos( time * 0.9 ) * 96 + this.bounds.height );
    */
};

/**
 * @public
 *
 * @param {Image|string=} aImage image, can be either HTMLImageElement or base64 encoded string
 *                        image is optional as we might be interested in just scaling the
 *                        current image using aNewWidth and aNewHeight
 * @param {number=} aNewWidth optional new width of the image
 * @param {number=} aNewHeight optional new height of the image
 */
zgor.ZSprite.prototype.updateImage = function( aImage, aNewWidth, aNewHeight )
{
    if ( aImage )
    {
        if ( aImage instanceof Image )
        {
            this._image = aImage;
        }
        else
        {
            if ( !this._image ) {
                this._image = new Image();
            }
            this._image.src = aImage;
        }
    }

    // update width and height if defined
    // reposition relatively from the center

    if ( aNewWidth )
    {
        var prevWidth     = this.bounds.width;
        this.bounds.width = aNewWidth;
        this.bounds.left -= ( aNewWidth * .5 - prevWidth * .5 );
    }
    if ( aNewHeight )
    {
        var prevHeight     = this.bounds.height;
        this.bounds.height = aNewHeight;
        this.bounds.top   -= ( aNewHeight *.5 - prevHeight *.5 );
    }

    // make sure the image is still in bounds

    if ( this._keepInBounds && ( aNewWidth || aNewHeight ))
    {
        var minX = -( this.bounds.width  - this.zCanvas.getWidth() );
        var minY = -( this.bounds.height - this.zCanvas.getHeight() );

        if ( this.bounds.left > 0 ) {
            this.bounds.left = 0;
        }
        else if ( this.bounds.left < minX ) {
            this.bounds.left = minX;
        }

        if ( this.bounds.top > 0 ) {
            this.bounds.top = 0;
        }
        else if ( this.bounds.top < minY ) {
            this.bounds.top = minY;
        }
    }
};

/**
 * @public
 * @return {number}
 */
zgor.ZSprite.prototype.getX = function()
{
    return this.bounds.left;
};

/**
 * @public
 * @param {number} aValue
 */
zgor.ZSprite.prototype.setX = function( aValue )
{
    var delta        = aValue - this.bounds.left;
    this.bounds.left = aValue;

    // as the offsets of the children are drawn relative to the Canvas, we
    // must update their offsets by the delta value too

    if ( this._children.length > 0 )
    {
        var theChild = this._children[ 0 ];

        while ( theChild )
        {
            if ( !theChild.isDragging ) {
                theChild.setX( theChild.getX() + delta );
            }
            theChild = theChild.next;
        }
    }
};

/**
 * @public
 * @return {number}
 */
zgor.ZSprite.prototype.getY = function()
{
    return this.bounds.top;
};

/**
 * @public
 * @param {number} aValue
 */
zgor.ZSprite.prototype.setY = function( aValue )
{
    var delta       = aValue - this.bounds.top;
    this.bounds.top = aValue;

    // as the offsets of the children are drawn relative to the Canvas, we
    // must update their offsets by the delta value too

    if ( this._children.length > 0 )
    {
        var theChild = this._children[ 0 ];

        while ( theChild )
        {
            if ( !theChild.isDragging ) {
                theChild.setY( theChild.getY() + delta );
            }
            theChild = theChild.next;
        }
    }
};

/**
 * @public
 * @return {Object}
 */
zgor.ZSprite.prototype.getBounds = function()
{
    return this.bounds;
};

/**
 * @override
 * @public
 * @returns {Element}
 */
zgor.ZSprite.prototype.getElement = function()
{
    // inherited from interface, no actual element to return !!
};

/**
 * set a reference to the parent sprite containing this one
 *
 * @override
 * @public
 * @param {zgor.ZSprite} aParent
 */
zgor.ZSprite.prototype.setParent = function( aParent )
{
    this._parent = /** @type {zgor.ZSprite} */ ( aParent );
};

/**
 * @public
 * @return {zgor.ZSprite} parent
 */
zgor.ZSprite.prototype.getParent = function()
{
    return this._parent;
};

/**
 * get a child of this Sprite by its index in the Display List
 *
 * @public
 * @param {number} index of the object in the Display List
 * @return {zgor.ZSprite} the referenced object
 */
zgor.ZSprite.prototype.getChildAt = function( index )
{
    return this._children[ index ];
};

/**
 * remove a child from this object's Display List at the given index
 *
 * @public
 * @param {number} index of the object to remove
 */
zgor.ZSprite.prototype.removeChildAt = function( index )
{
    this.removeChild( this.getChildAt( index ));
};

/**
 * @public
 * @return {number} the amount of children in this object's Display List
 */
zgor.ZSprite.prototype.numChildren = function()
{
    return this._children.length;
};

/**
 * @public
 *
 * @param {zgor.ZSprite} aChild
 * @return {zgor.ZSprite} this object - for chaining purposes
 */
zgor.ZSprite.prototype.addChild = function( aChild )
{
    // create a linked list
    var numChildren = this._children.length;

    if ( numChildren > 0 )
    {
        aChild.last      = this._children[ numChildren - 1 ];
        aChild.last.next = aChild;
        aChild.next      = null;
    }
    aChild.setParent( this, this._useEventBubbling );
    this._children.push( aChild );

    return this;
};

/**
 * @public
 * @param {zgor.ZSprite} aChild  the child to remove from this Object
 */
zgor.ZSprite.prototype.removeChild = function( aChild )
{
    aChild.dispose();

    var i = this._children.length;

    while ( i-- )
    {
        if ( this._children[ i ] == aChild )
        {
            this._children.splice( i, 1 );
        }
    }
    aChild.setParent( null );

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
};

/**
 * check whether a given display object is present in this object's display list
 *
 * @public
 * @param {zgor.ZSprite} aChild
 * @return {boolean}
 */
zgor.ZSprite.prototype.contains = function( aChild )
{
    var i = this.numChildren();

    while ( i-- )
    {
        if ( this._children[ i ] == aChild )
        {
            return true;
        }
    }
    return false;
};

/* event handlers */

/**
 * invoked when the user interacts with the Canvas, this method evaluates
 * the event data and applies it to this object when applicable
 *
 * @public
 *
 * @param {number} aEventX the events X offset, passed for quick evaluation of position updates
 * @param {number} aEventY the events Y offset, passed for quick evaluation of position updates
 * @param {Event} aEvent the original event for further querying
 *
 * @return {boolean} whether this zSprite has handled the event
 */
zgor.ZSprite.prototype.handleInteraction = function( aEventX, aEventY, aEvent )
{
    if ( !this._draggable )
        return false;

    // first traverse the children of this sprite
    var foundInteractionInChild = false;

    var thisX = this.getX();
    var thisY = this.getY();

    if ( this._children.length > 0 )
    {
        var theChild = this._children[ 0 ];

        while ( theChild )
        {
            foundInteractionInChild = theChild.handleInteraction( aEventX, aEventY, aEvent );

            // child is higher in DisplayList, takes precedence over this parent
            if ( foundInteractionInChild )
                return true;

            theChild = theChild.next;
        }
    }

    // did we have a previous interaction and the 'up' event was fired?
    // unset this property or update the position in case the event is a move event
    if ( this.isDragging )
    {
        if ( aEvent.type == "touchend" ||
             aEvent.type == "mouseup" )
        {
            this.handleRelease();
            return true;
        }
    }
    // evaluate if the event applies to this sprite by
    // matching the event offset with the Sprite bounds

    var coordinates = this.bounds;

    if ( aEventX >= thisX && aEventX <= ( thisX + coordinates.width ) &&
         aEventY >= thisY && aEventY <= ( thisY + coordinates.height ))
    {
        // yes sir, we've got a match
        if ( !this.isDragging )
        {
            if ( aEvent.type == "touchstart" ||
                 aEvent.type == "mousedown" )
            {
                this.handlePress( aEventX, aEventY );
                return true;
            }
        }
    }

    // the move handler is outside of the bounds check to
    // ensure we don't lose the handle by quickly moving around...

    if ( this.isDragging )
    {
        this.handleMove( aEventX, aEventY );
        return true;
    }
    return false;
};

/**
 * invoked when a click / tap event has been registered
 *
 * @protected
 */
zgor.ZSprite.prototype.handleClick = function()
{
    // override in class extension
};

/**
 * press handler, invoked by the "handleInteraction"-method
 * this method will delegate drag and click logic
 *
 * @private
 *
 * @param {number} aXPosition
 * @param {number} aYPosition
 */
zgor.ZSprite.prototype.handlePress = function( aXPosition, aYPosition )
{
    this.isDragging     = true;
    this._dragStartTime = +new Date();

    this._dragStartOffset            = { "x" : this.bounds.left, "y" : this.bounds.top };
    this.__dragStartEventCoordinates = { "x" : aXPosition,       "y" : aYPosition };
};

/**
 * move handler, invoked by the "handleInteraction"-method
 * this method will delegate drag logic
 *
 * @private
 *
 * @param {number} aXPosition
 * @param {number} aYPosition
 */
zgor.ZSprite.prototype.handleMove = function( aXPosition, aYPosition )
{
    var thisHalfWidth  = this.bounds.width  * .5;
    var thisHalfHeight = this.bounds.height * .5;

    var theX, theY;

    theX = this._dragStartOffset.x + ( aXPosition - this.__dragStartEventCoordinates.x );
    theY = this._dragStartOffset.y + ( aYPosition - this.__dragStartEventCoordinates.y );

    // in case of dragging from center, use the following (not usable when image exceeds stage dimensions!!)
    //theX = aXPosition - thisHalfWidth;
    //theY = aYPosition - thisHalfHeight;

    if ( this.zCanvas )
    {
        var stageWidth  = this.zCanvas.getWidth();
        var stageHeight = this.zCanvas.getHeight();

        // keep within bounds ?

        if ( this._keepInBounds )
        {
            var minX = -( this.bounds.width  - stageWidth );
            var minY = -( this.bounds.height - stageHeight );

            if ( theX > 0 ) {
                theX = 0;
            }
            else if ( theX < minX ) {
                theX = minX;
            }

            if ( theY > 0 ) {
                theY = 0;
            }
            else if ( theY < minY ) {
                theY = minY;
            }
        }
        else
        {
            if ( theX < 0 ) {
                theX = aXPosition - thisHalfWidth;
            }
            else if ( theX > stageWidth ) {
                theX = aXPosition + thisHalfWidth;
            }

            if ( theY < 0 ) {
                theY = aYPosition - thisHalfHeight;
            }
            else if ( theY > stageHeight ) {
                theY = aYPosition + thisHalfHeight;
            }
        }
    }
    this.setX( theX );
    this.setY( theY );
};

/**
 * unpress handler, invoked by the "handleInteraction"-method
 * this method will delegate drag and click logic
 *
 * @private
 */
zgor.ZSprite.prototype.handleRelease = function()
{
    this.isDragging = false;

    // in case we only handled this object for a short
    // period, we assume it was clicked / tapped

    if ( /** @type {number} */ ( +new Date() ) - this._dragStartTime < 250 )
    {
        this.handleClick();
    }
};

/* protected methods */

/**
 * @override
 * @protected
 */
zgor.ZSprite.prototype.disposeInternal = function()
{
    // dispose the children
    var i = this._children.length;

    while ( i-- )
    {
        var theChild = this._children[ i ];
        theChild.dispose();
        theChild.next = theChild.last = null;   // break references
    }
    this._children = [];
};
