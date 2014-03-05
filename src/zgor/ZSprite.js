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
 *
 * the basic zSprite renders an Image onto a zCanvas and can capture interaction events, and be draggable
 *
 * inheriting classes that require custom logic should override the public "update"-method which is
 * invoked prior before the contents of this Sprite are rendered onto the zCanvas
 *
 * inheriting classes that have custom draw logic, should also override the public "draw"-method which is used
 * for drawing the zSprite's visual representation onto the zCanvas. This method is invoked on each draw cycle.
 *
 * @constructor
 * @extends {util.Disposable}
 *
 * @param {number}        aXPos (initial) x-coordinate position of this sprite
 * @param {number}        aYPos (initial) y-coordinate position of this sprite
 * @param {number}        aWidth the width this Sprite will occupy on the zCanvas
 * @param {number}        aHeight the height this Sprite will occupy on the zCanvas
 * @param {Image|string=} aImageSource optional image, when given, no override of the "draw"-method is required, as
 *                        it will render the image by default at the current coordinates and at the given
 *                        width and height. aImageSource can be either HTMLImageElement or a base64 encoded string
 *                        if not defined, you must override the "draw"-method as otherwise this sprite won't
 *                        render anything onto the zCanvas
 * @param {boolean=}      aIsCollidable optionally whether this Sprite can collide with others
 */
zgor.ZSprite = function( aXPos, aYPos, aWidth, aHeight, aImageSource, aIsCollidable )
{
    if ( aImageSource )
    {
        if ( aImageSource instanceof Image )
        {
            this._image      = aImageSource;
            this._imageReady = true;    // source is loaded
        }
        else
        {
            this.createImageFromSource( aImageSource );
        }
    }
    this._bounds     = { "left" : aXPos, "top" : aYPos, "width" : aWidth, "height" : aHeight };
    this.collidable = aIsCollidable || false;
    this._children  = [];
};

// inherit from parent Disposable
zgor.ZSprite.prototype = new util.Disposable();

/* class variables */

/**
 * rectangle describing this sprites bounds
 * (relative to the zCanvas)
 *
 * @public
 * @type {{ left: number, top: number, width: number, height: number }}
 */
zgor.ZSprite.prototype._bounds;

/**
 * whether this zSprite can collide with others
 *
 * @public
 * @type {boolean}
 */
zgor.ZSprite.prototype.collidable;

/**
 * @protected
 * @type {zgor.ZSprite}
 *
 * stores a reference to the containing zSprite
 */
zgor.ZSprite.prototype._parent = null;

/**
 * @protected
 * @type {Image}
 */
zgor.ZSprite.prototype._image;

/**
 * whether this zSprite is ready for drawing (will be false
 * when an Image source is used and the Image is still loading its data)
 *
 * @protected
 * @type {boolean}
 */
zgor.ZSprite.prototype._imageReady = false;

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
 * NOTE : will be null if the zSprite isn't added to
 * the display list
 *
 * @public
 * @type {zgor.zCanvas}
 */
zgor.ZSprite.prototype.canvas;

/* public methods */

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
 * @public
 *
 * @return {number}
 */
zgor.ZSprite.prototype.getX = function()
{
    return this._bounds.left;
};

/**
 * @public
 *
 * @param {number} aValue
 */
zgor.ZSprite.prototype.setX = function( aValue )
{
    var delta         = aValue - this._bounds.left;
    this._bounds.left = aValue;

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
 *
 * @return {number}
 */
zgor.ZSprite.prototype.getY = function()
{
    return this._bounds.top;
};

/**
 * @public
 *
 * @param {number} aValue
 */
zgor.ZSprite.prototype.setY = function( aValue )
{
    var delta        = aValue - this._bounds.top;
    this._bounds.top = aValue;

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
 *
 * @return {number}
 */
zgor.ZSprite.prototype.getWidth = function()
{
    return this._bounds.width;
};

/**
 * @public
 *
 * @return {number}
 */
zgor.ZSprite.prototype.getHeight = function()
{
    return this._bounds.height;
};

/**
 * @public
 *
 * @return {{ left: number, top: number, width: number, height: number }}
 */
zgor.ZSprite.prototype.getBounds = function()
{
    return this._bounds;
};

/**
 * invoked on each render cycle before the draw-method
 * is invoked, you can override this in your subclass
 * for custom logic / animation such as updating the
 * state of this Object (like position, size, etc.)
 *
 * @public
 *
 * @param {number} aCurrentTimestamp the current timestamp
 *                 which can be used to create strict timed animations
 */
zgor.ZSprite.prototype.update = function( aCurrentTimestamp )
{
    // override in prototype-extensions or instance
};

/**
 * @public
 *
 * @param {CanvasRenderingContext2D} aCanvasContext to draw on
 */
zgor.ZSprite.prototype.draw = function( aCanvasContext )
{
    // extend in subclass if you're drawing a custom object instead of a graphical Image asset
    // don't forget to draw the child display list when overriding this method!

    if ( this._imageReady )
    {
        var bounds = this._bounds;

        aCanvasContext.drawImage( this._image, bounds.left, bounds.top, bounds.width, bounds.height );
    }

    // draw this Sprites children onto the canvas

    if ( this._children.length > 0 )
    {
        var theSprite = this._children[ 0 ];

        while ( theSprite )
        {
            theSprite.update();
            theSprite.draw( aCanvasContext, aCurrentTimestamp );

            theSprite = theSprite.next;
        }
    }
};

/**
 * queries the bounding box of another sprite to check whether it overlaps the bounding box of this sprite, this
 * can be used as a fast method to detect collisions, though note it is less accurate than checking at the pixel level
 * via the zCanvas "checkCollision"-method as it will match the entire bounding box, and omit checking for transparent
 * areas !
 *
 * @public
 *
 * @param {zgor.ZSprite} aSprite the sprite to check against
 *
 * @return {boolean} whether a collision has been detected
 */
zgor.ZSprite.prototype.collidesWith = function( aSprite )
{
    // checking ourselves are we ?

    if ( aSprite == this )
        return false;

    var otherX = aSprite.getX(), otherY = aSprite.getY(), otherWidth = aSprite.getWidth(), otherHeight = aSprite.getHeight();
    var myX    = this.getX(), myY = this.getY(), myWidth = this.getWidth(), myHeight = this.getHeight();

    return ( otherX < myX + myWidth  && otherX + otherWidth > myX &&
             otherY < myY + myHeight && otherY + otherHeight > myY );
};

/**
 * queries the bounding box of another sprite to check whether its edges collide
 * with the edges of this sprite, this can be used as a fast method to detect whether
 * movement should be impaired on either side of this sprite (for instance wall collision detection)
 *
 * NOTE : ONLY query against results of ZCanvas' "getChildrenUnderPoint"-method as for brevity (and speeds)
 * sake, we only check the desired plane, and not against the other axis.
 *
 * @public
 *
 * @param {zgor.ZSprite} aSprite the sprite to check against
 * @param {number} aEdge the edge to check 0 = left, 1 = above, 2 = right, 3 = below this is relative
 *                 to the edge of THIS sprite
 *
 * @param {boolean} whether collision with the given edge has been detected
 */
zgor.ZSprite.prototype.collidesWithEdge = function( aSprite, aEdge )
{
    if ( aSprite == this )
        return false;

    if ( isNaN( aEdge ) || aEdge < 0 || aEdge > 3 )
        throw new Error( "invalid argument for edge" );

    switch ( aEdge )
    {
        case 0: // left
            return ( this.getX() <= aSprite.getX() + aSprite.getWidth() );

        case 1: // above
            return ( this.getY() <= aSprite.getY() + aSprite.getHeight() );

        case 2: // right
            return ( this.getX() + this.getWidth() <= aSprite.getX() );

        case 3: // below
            return ( this.getY() + this.getHeight() >= aSprite.getY() );
    }
    return false;
};

/**
 * update / replace the Image contents of this zSprite, can be used
 * to swap spritesheets (for instance)
 *
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
            this.createImageFromSource( aImage );
        }
    }

    // update width and height if defined
    // reposition relatively from the center

    if ( aNewWidth )
    {
        var prevWidth     = this._bounds.width || 0;
        this._bounds.width = aNewWidth;
        this._bounds.left -= ( aNewWidth * .5 - prevWidth * .5 );
    }
    if ( aNewHeight )
    {
        var prevHeight     = this._bounds.height || 0;
        this._bounds.height = aNewHeight;
        this._bounds.top   -= ( aNewHeight *.5 - prevHeight *.5 );
    }

    // make sure the image is still in bounds

    if ( this._keepInBounds && ( aNewWidth || aNewHeight ))
    {
        var minX = -( this._bounds.width  - this.canvas.getWidth() );
        var minY = -( this._bounds.height - this.canvas.getHeight() );

        if ( this._bounds.left > 0 ) {
            this._bounds.left = 0;
        }
        else if ( this._bounds.left < minX ) {
            this._bounds.left = minX;
        }

        if ( this._bounds.top > 0 ) {
            this._bounds.top = 0;
        }
        else if ( this._bounds.top < minY ) {
            this._bounds.top = minY;
        }
    }
};

/**
 * set a reference to the parent sprite containing this one
 *
 * @override
 * @public
 *
 * @param {zgor.ZSprite} aParent
 */
zgor.ZSprite.prototype.setParent = function( aParent )
{
    this._parent = /** @type {zgor.ZSprite} */ ( aParent );
};

/**
 * @public
 *
 * @return {zgor.ZSprite} parent
 */
zgor.ZSprite.prototype.getParent = function()
{
    return this._parent;
};

/**
 * append another zSprite to the display list of this sprite
 *
 * @public
 *
 * @param {zgor.ZSprite} aChild to append
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
    aChild.canvas = this.canvas;
    aChild.setParent( this );

    this._children.push( aChild );

    return this;
};

/**
 * remove a child zSprite from this sprites display list
 *
 * @public
 * @param {zgor.ZSprite} aChild the child to remove
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
    aChild.canvas = null;
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
 * invoked when the user clicks / touches this sprite, NOTE : this
 * is a "down"-handler and indicates the sprite has just been touched
 *
 * @protected
 *
 * @param {number} aXPosition position of the touch / cursor
 * @param {number} aYPosition position of the touch / cursor
 */
zgor.ZSprite.prototype.handlePress = function( aXPosition, aYPosition )
{
    // override in prototype-extensions or instance
};

/**
 * invoked when the user releases touch of this (previously pressed) Sprite
 *
 * @protected
 */
zgor.ZSprite.prototype.handleRelease = function()
{
    // override in prototype-extensions or instance
};

/**
 * invoked when user has clicked / tapped this Sprite, this indicates
 * the user has pressed and released within 250 ms
 *
 * @protected
 */
zgor.ZSprite.prototype.handleClick = function()
{
    // override in prototype-extensions or instance
};

/**
 * move handler, invoked by the "handleInteraction"-method
 *
 * @private
 *
 * @param {number} aXPosition
 * @param {number} aYPosition
 */
zgor.ZSprite.prototype.handleMove = function( aXPosition, aYPosition )
{
    var thisHalfWidth  = this._bounds.width  * .5;
    var thisHalfHeight = this._bounds.height * .5;

    var theX, theY;

    theX = this._dragStartOffset.x + ( aXPosition - this.__dragStartEventCoordinates.x );
    theY = this._dragStartOffset.y + ( aYPosition - this.__dragStartEventCoordinates.y );

    // in case of dragging from center, use the following (not usable when image exceeds stage dimensions!!)
    //theX = aXPosition - thisHalfWidth;
    //theY = aYPosition - thisHalfHeight;

    var stageWidth  = this.canvas.getWidth();
    var stageHeight = this.canvas.getHeight();

    // keep within bounds ?

    if ( this._keepInBounds )
    {
        var minX = -( this._bounds.width  - stageWidth );
        var minY = -( this._bounds.height - stageHeight );

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
    this.setX( theX );
    this.setY( theY );
};

/**
 * invoked when the user interacts with the zCanvas, this method evaluates
 * the event data and checks whether it applies to this sprite and
 * when it does, applicable delegate handlers will be invoked on this Object
 * (see "handlePress", "handleRelease", "handleClick", "handleMove")
 *
 * do NOT override this method, override the individual "protected" handlers instead
 *
 * @public
 *
 * @param {number} aEventX the events X offset, passed for quick evaluation of position updates
 * @param {number} aEventY the events Y offset, passed for quick evaluation of position updates
 * @param {Event} aEvent the original event that triggered this action
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
            this.isDragging = false;

            // in case we only handled this object for a short
            // period (250 ms), we assume it was clicked / tapped

            if ( /** @type {number} */ ( +new Date() ) - this._dragStartTime < 250 )
            {
                this.handleClick();
            }

            this.handleRelease();
            return true;
        }
    }
    // evaluate if the event applies to this sprite by
    // matching the event offset with the Sprite bounds

    var coordinates = this._bounds;

    if ( aEventX >= thisX && aEventX <= ( thisX + coordinates.width ) &&
         aEventY >= thisY && aEventY <= ( thisY + coordinates.height ))
    {
        // yes sir, we've got a match
        if ( !this.isDragging )
        {
            if ( aEvent.type == "touchstart" ||
                 aEvent.type == "mousedown" )
            {
                this.isDragging     = true;
                this._dragStartTime = +new Date();

                this._dragStartOffset            = { "x" : this._bounds.left, "y" : this._bounds.top };
                this.__dragStartEventCoordinates = { "x" : aEventX, "y" : aEventY };

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

/**
 * creates a drawable image from a supplied base64 image source
 *
 * @protected
 *
 * @param {string} aImageSource base64 encoded image data
 */
zgor.ZSprite.prototype.createImageFromSource = function( aImageSource )
{
    this._imageReady   = false;    // we can only draw once the image has been fully loaded!
    this._image        = new Image();

    // prepare load callback via managed handler
    var eventHandler = new util.EventHandler();
    var loadCallback = util.bind( function( e )
    {
        this._imageReady = true;
        eventHandler.dispose();  // will clean up listeners

    }, this );

    eventHandler.addEventListener( this._image, "load", loadCallback );

    // load the image
    this._image.src = aImageSource;
};
