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
        define( aName, [ "helpers", "zCanvas" ], function( helpers, zCanvas ) { return aModule(); });

    // Browser global
    else this[ aName ] = aModule;

}( "zSprite", function()
{
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
     * @extends {helpers.Disposable}
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
     * @param {boolean=}      aIsMask optional, whether to use this sprite as a mask
     */
    var zSprite = function( aXPos, aYPos, aWidth, aHeight, aImageSource, aIsCollidable, aIsMask )
    {
        if ( typeof aXPos   !== "number" ||
             typeof aYPos   !== "number" ||
             typeof aWidth  !== "number" ||
             typeof aHeight !== "number" )
        {
            throw new Error( "cannot construct a zSprite without valid coordinates and dimensions" );
        }

        if ( aImageSource )
        {
            if ( aImageSource instanceof Image )
            {
                this._image      = aImageSource;
                this._imageReady = true;    // source is loaded
            }
            else if ( typeof aImageSource === "string" )
            {
                this.createImageFromSource( aImageSource );
            }
            else {
                throw new Error( "expected Image or String for Image source, got " + aImageSource + " instead" );
            }
        }
        this.collidable  = aIsCollidable || false;
        this._children   = [];
        this._bounds     = { "left" : 0, "top" : 0, "width" : aWidth, "height" : aHeight };
        this._mask       = aIsMask || false;

        this.setX( aXPos );
        this.setY( aYPos );
    };

    // inherit from parent Disposable
    helpers.extend( zSprite, helpers.Disposable );

    /* class variables */

    /**
     * rectangle describing this sprites bounds relative to the zCanvas
     * basically this describes its x- and y- coordinates and its dimensions
     *
     * @public
     * @type {{ left: number, top: number, width: number, height: number }}
     */
    zSprite.prototype._bounds;

    /**
     * rectangle describing this sprites restrictions (only applicable
     * to draggable zSprites to ensure they remain within these bounds)
     *
     * @protected
     * @type {{ left: number, top: number, width: number, height: number }}
     */
    zSprite.prototype._constraint;

    /**
     * whether this zSprite can collide with others
     *
     * @public
     * @type {boolean}
     */
    zSprite.prototype.collidable;

    /**
     * whether this zSprites image contents should function as a mask
     * (for instance to obscure the contents of underlyting zSprites)
     *
     * @protected
     * @type {boolean}
     */
    zSprite.prototype._mask;

    /**
     * @protected
     * @type {zSprite}
     *
     * stores a reference to the containing zSprite
     */
    zSprite.prototype._parent = null;

    /**
     * @protected
     * @type {Image}
     */
    zSprite.prototype._image;

    /**
     * whether this zSprite is ready for drawing (will be false
     * when an Image source is used and the Image is still loading its data)
     *
     * @protected
     * @type {boolean}
     */
    zSprite.prototype._imageReady = false;

    /**
     * @private
     * @type {boolean}
     */
    zSprite.prototype._draggable = false;

    /**
     * whether this zSprite can receive user interaction events, when
     * false this Sprite is omitted from "handleInteraction"-queries
     * executed when the user interacts with the parent StageCanvas element
     *
     * @protected
     * @type {boolean}
     */
    zSprite.prototype._interactive = false;

    /**
     * indicates the user is currently hovering over this Sprite, note
     * this DOES NOT mean we are dragging (see _dragging) this value
     * will ALWAYS be false if the zSprite is not interactive
     *
     * @public
     * @type {boolean}
     */
    zSprite.prototype.hover = false;

    /**
     * whether to restrict this zSprites movement
     * to its constraints / zCanvas dimensions
     *
     * @private
     * @type {boolean}
     */
    zSprite.prototype._keepInBounds = false;

    /**
     * @public
     * @type {boolean}
     */
    zSprite.prototype.isDragging = false;

    /**
     * timestamp of the moment drag was enabled, used for
     * determining on release whether interaction was actually a tap/click
     *
     * @protected
     * @type {number}
     */
    zSprite.prototype._dragStartTime = 0;

    /**
     * the coordinates of the click/touch event at the moment
     * drag was enabled
     *
     * @protected
     * @type {Object} w/ properties x and y
     */
    zSprite.prototype._dragStartEventCoordinates;

    /**
     * this Sprites coordinates at the moment drag was enabled
     *
     * @protected
     * @type {Object} w/ properties x and y
     */
    zSprite.prototype._dragStartOffset;

    /**
     * we use a linked list to quickly traverse the DisplayList
     * of the zCanvas
     *
     * @public
     * @type {zSprite|null}
     */
    zSprite.prototype.last = null;

    /**
     * we use a linked list to quickly traverse the DisplayList
     * of the zCanvas
     *
     * @public
     * @type {zSprite|null}
     */
    zSprite.prototype.next = null;

    /**
     * reference to the zCanvas holding this zSprite
     * NOTE : will be null if the zSprite isn't present on
     * the ZCanvas' display list
     *
     * @public
     * @type {zCanvas}
     */
    zSprite.prototype.canvas = null;

    /* public methods */

    /**
     * whether the zSprite is draggable
     *
     * @public
     * @return {boolean}
     */
    zSprite.prototype.getDraggable = function()
    {
        return this._draggable;
    };

    /**
     * toggle the draggable mode of this zSprite
     *
     * @public
     *
     * @param {boolean} aValue whether we want to activate / deactivate the dragging mode
     * @param {boolean=} aKeepInBounds optional, whether we should keep dragging within bounds
     *                   this will default to the bounds of the canvas, or can be a custom
     *                   restraint (see "setConstraint")
     */
    zSprite.prototype.setDraggable = function( aValue, aKeepInBounds )
    {
        this._draggable    = aValue;
        this._keepInBounds = aKeepInBounds || false;

        // if we want to drag this zSprite and it isn't interactive, set it as interactive
        // otherwise it will not receive any interaction events from the zCanvas

        if ( aValue && !this._interactive ) {
            this.setInteractive( true );
        }
    };

    /**
     * @public
     *
     * @return {number}
     */
    zSprite.prototype.getX = function()
    {
        return this._bounds.left;
    };

    /**
     * @public
     *
     * @param {number} aValue
     */
    zSprite.prototype.setX = function( aValue )
    {
        var delta         = aValue - this._bounds.left;
        this._bounds.left = this._constraint ? aValue + this._constraint.left : aValue;

        // as the offsets of the children are drawn relative to the Canvas, we
        // must update their offsets by the delta value too

        if ( this._children.length > 0 )
        {
            var theChild = this._children[ 0 ];

            while ( theChild )
            {
                if ( !theChild.isDragging ) {
                    theChild.setX( theChild._bounds.left + delta );
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
    zSprite.prototype.getY = function()
    {
        return this._bounds.top;
    };

    /**
     * @public
     *
     * @param {number} aValue
     */
    zSprite.prototype.setY = function( aValue )
    {
        var delta        = aValue - this._bounds.top;
        this._bounds.top = this._constraint ? aValue + this._constraint.top : aValue;

        // as the offsets of the children are drawn relative to the Canvas, we
        // must update their offsets by the delta value too

        if ( this._children.length > 0 )
        {
            var theChild = this._children[ 0 ];

            while ( theChild )
            {
                if ( !theChild.isDragging ) {
                    theChild.setY( theChild._bounds.top + delta );
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
    zSprite.prototype.getWidth = function()
    {
        return this._bounds.width;
    };

    /**
     * @public
     *
     * @return {number}
     */
    zSprite.prototype.getHeight = function()
    {
        return this._bounds.height;
    };

    /**
     * @public
     *
     * @return {{ left: number, top: number, width: number, height: number }}
     */
    zSprite.prototype.getBounds = function()
    {
        return this._bounds;
    };

    /**
     * whether this Sprite is interactive (should responds to user
     * interactions such as mouse hover, mouse clicks / touches, etc.)
     *
     * @public
     * @return {boolean}
     */
    zSprite.prototype.getInteractive = function()
    {
        return this._interactive;
    };

    /**
     * toggle the interactive state of this zSprite
     *
     * @public
     *
     * @param {boolean} aValue
     */
    zSprite.prototype.setInteractive = function( aValue )
    {
        this._interactive = aValue;
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
    zSprite.prototype.update = function( aCurrentTimestamp )
    {
        // override in prototype-extensions or instance
        // recursively update this sprites children :

        if ( this._children.length > 0 )
        {
            var theSprite = this._children[ 0 ];

            while ( theSprite )
            {
                theSprite.update( aCurrentTimestamp );
                theSprite = theSprite.next;
            }
        }
    };

    /**
     * update the position of this Sprite, where setX and setY operate directly on the
     * Sprites coordinates, this method validates the requested coordinates against the
     * defined constraints of this Sprite to ensure it remains within bounds
     *
     * @public
     *
     * @param {number=} aXPosition optionally desired x-coordinate, defaults to current position
     * @param {number=} aYPosition optionally desired y-coordinate, defaults to current position
     */
    zSprite.prototype.updatePosition = function( aXPosition, aYPosition )
    {
        if ( typeof aXPosition !== "number" ) {
            aXPosition = this._bounds.left;
        }
        if ( typeof aYPosition !== "number" ) {
            aYPosition = this._bounds.top;
        }

        if ( this._constraint ) {
            aXPosition -= this._constraint.left;
            aYPosition -= this._constraint.top;
        }
        else if ( !this.canvas ) {
            throw new Error( "cannot update position of a zSprite that has no constraint or is not added to a zCanvas" );
        }

        var thisWidth   = this._bounds.width;
        var thisHeight  = this._bounds.height;
        var stageWidth  = this._constraint ? this._constraint.width  : this.canvas.width;
        var stageHeight = this._constraint ? this._constraint.height : this.canvas.height;

        // keep within bounds ?

        if ( this._keepInBounds )
        {
            // There is a very small chance that the bounds width/height compared to stage width/height
            // is only very slightly different, which will produce a positive numeric result very close to,
            // but not quite zero. To play it safe, we will limit it to a maximum of 0.
            var minX = Math.min( 0, -( thisWidth  - stageWidth  ));
            var minY = Math.min( 0, -( thisHeight - stageHeight ));
            var maxX = stageWidth  - thisWidth;
            var maxY = stageHeight - thisHeight;

            aXPosition = Math.min( maxX, Math.max( aXPosition, minX ));
            aYPosition = Math.min( maxY, Math.max( aYPosition, minY ));
        }
        else
        {
            /*if ( aXPosition < 0 ) {
             aXPosition = aXPosition - ( thisWidth  * .5 );
             }
             else*/ if ( aXPosition > stageWidth ) {
            aXPosition = aXPosition + ( thisWidth  * .5 );
        }

            /*if ( aYPosition < 0 ) {
             aYPosition = aYPosition - ( thisHeight * .5 );
             }
             else*/ if ( aYPosition > stageHeight ) {
            aYPosition = aYPosition + ( thisHeight * .5 );
        }
        }
        this.setX( aXPosition );
        this.setY( aYPosition );
    };

    /**
     * @public
     *
     * @param {CanvasRenderingContext2D} aCanvasContext to draw on
     */
    zSprite.prototype.draw = function( aCanvasContext )
    {
        // extend in subclass if you're drawing a custom object instead of a graphical Image asset
        // don't forget to draw the child display list when overriding this method!

        aCanvasContext.save();

        // zSprite acts as a mask for underlying Sprites ?

        if ( this._mask ) {
            aCanvasContext.globalCompositeOperation = 'destination-in';
        }

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
                theSprite.draw( aCanvasContext );
                theSprite = theSprite.next;
            }
        }

        // restore canvas drawing operation so subsequent sprites draw as overlay

        if ( this._mask ) {
            aCanvasContext.globalCompositeOperation = 'source-over';
        }

        aCanvasContext.restore();

        // draw an outline when in debug mode

        if ( this.canvas.DEBUG ) {
            this.drawOutline( aCanvasContext );
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
     * @param {zSprite} aSprite the sprite to check against
     *
     * @return {boolean} whether a collision has been detected
     */
    zSprite.prototype.collidesWith = function( aSprite )
    {
        // checking ourselves are we ?

        if ( aSprite == this )
            return false;

        var otherX      = aSprite.getX(),
            otherY      = aSprite.getY(),
            otherWidth  = aSprite.getWidth(),
            otherHeight = aSprite.getHeight(),
            myX         = this.getX(),
            myY         = this.getY(),
            myWidth     = this.getWidth(),
            myHeight    = this.getHeight();

        return ( otherX < myX + myWidth  && otherX + otherWidth  > myX &&
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
     * @param {zSprite} aSprite the sprite to check against
     * @param {number} aEdge the edge to check 0 = left, 1 = above, 2 = right, 3 = below this is relative
     *                 to the edge of THIS sprite
     *
     * @return {boolean} whether collision with the given edge has been detected
     */
    zSprite.prototype.collidesWithEdge = function( aSprite, aEdge )
    {
        if ( aSprite === this )
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
    zSprite.prototype.updateImage = function( aImage, aNewWidth, aNewHeight )
    {
        if ( aImage )
        {
            if ( aImage instanceof Image )
            {
                this._image = aImage;
            }
            else if ( typeof aImage === "string" )
            {
                this.createImageFromSource( aImage );
            }
        }

        // update width and height if defined
        // reposition relatively from the center

        if ( aNewWidth )
        {
            var prevWidth      = this._bounds.width || 0;
            this._bounds.width = aNewWidth;
            this._bounds.left -= ( aNewWidth * .5 - prevWidth * .5 );
        }
        if ( aNewHeight )
        {
            var prevHeight      = this._bounds.height || 0;
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
     * @param {zSprite} aParent
     */
    zSprite.prototype.setParent = function( aParent )
    {
        this._parent = /** @type {zSprite} */ ( aParent );
    };

    /**
     * @public
     *
     * @return {zSprite} parent
     */
    zSprite.prototype.getParent = function()
    {
        return this._parent;
    };

    /**
     * set a reference to the zCanvas that is rendering this sprite
     *
     * @public
     *
     * @param {zCanvas} aCanvas
     */
    zSprite.prototype.setCanvas = function( aCanvas )
    {
        this.canvas = aCanvas;

        // no constraint specified ? use stage bounds

        if ( !this._constraint && aCanvas )
        {
            this.setConstraint( 0, 0, aCanvas.getWidth(), aCanvas.getHeight() );
        }
    };

    /**
     * a zSprite can be constrained in its movement (when dragging) to ensure it remains
     * within desired boundaries
     *
     * a parent constraint specifies the boundaries of this zSprites "container"
     * which can be used when dragging this sprite within boundaries. this constraint
     * will by default be equal to the zCanvas' dimensions (when "setCanvas" is invoked)
     * but this method can be invoked to override it to a custom Rectangle
     *
     * @public
     *
     * @param {number} aLeft
     * @param {number} aTop
     * @param {number} aWidth
     * @param {number} aHeight
     *
     * @return {{ left: number, top: number, width: number, height: number }} the generated constraint Rectangle
     */
    zSprite.prototype.setConstraint = function( aLeft, aTop, aWidth, aHeight )
    {
        this._constraint = { "left" : aLeft, "top" : aTop, "width" : aWidth, "height" : aHeight };

        this._bounds.left = Math.max( aLeft, this._bounds.left );
        this._bounds.top  = Math.max( aTop,  this._bounds.top );

        this._keepInBounds = true;

        return this._constraint;
    };

    /**
     * @public
     *
     * @return {{ left: number, top: number, width: number, height: number }}
     */
    zSprite.prototype.getConstraint = function()
    {
        return this._constraint;
    };

    /**
     * append another zSprite to the display list of this sprite
     *
     * @public
     *
     * @param {zSprite} aChild to append
     * @return {zSprite} this object - for chaining purposes
     */
    zSprite.prototype.addChild = function( aChild )
    {
        // create a linked list
        var numChildren = this._children.length;

        if ( numChildren > 0 )
        {
            aChild.last      = this._children[ numChildren - 1 ];
            aChild.last.next = aChild;
            aChild.next      = null;
        }
        aChild.setCanvas( this.canvas );
        aChild.setParent( this );

        this._children.push( aChild );

        // request a render now the state of the canvas has changed

        if ( this.canvas ) {
            this.canvas.invalidate();
        }
        return this;
    };

    /**
     * remove a child zSprite from this sprites display list
     *
     * @public
     *
     * @param {zSprite} aChild the child to remove
     * @return {zSprite} the removed child
     */
    zSprite.prototype.removeChild = function( aChild )
    {
        aChild.setParent( null );
        aChild.setCanvas( null );
        //aChild.dispose(); // no, we might like to re-use the child at a later stage ?

        var i = this._children.length;

        while ( i-- )
        {
            if ( this._children[ i ] == aChild )
            {
                this._children.splice( i, 1 );
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

            if ( i == ( l - 1 )) {
                theSprite.next = null;
            }
        }

        // request a render now the state of the canvas has changed

        if ( this.canvas ) {
            this.canvas.invalidate();
        }
        return aChild;
    };

    /**
     * get a child of this Sprite by its index in the Display List
     *
     * @public
     *
     * @param {number} index of the object in the Display List
     * @return {zSprite} the zSprite present at the given index
     */
    zSprite.prototype.getChildAt = function( index )
    {
        return this._children[ index ];
    };

    /**
     * remove a child from this object's Display List at the given index
     *
     * @public
     *
     * @param {number} index of the object to remove
     * @return {zSprite} the zSprite removed at the given index
     */
    zSprite.prototype.removeChildAt = function( index )
    {
        return this.removeChild( this.getChildAt( index ));
    };

    /**
     * @public
     * @return {number} the amount of children in this object's Display List
     */
    zSprite.prototype.numChildren = function()
    {
        return this._children.length;
    };

    /**
     * check whether a given display object is present in this object's display list
     *
     * @public
     *
     * @param {zSprite} aChild
     * @return {boolean}
     */
    zSprite.prototype.contains = function( aChild )
    {
        var i = this.numChildren();

        while ( i-- )
        {
            if ( this._children[ i ] === aChild )
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
    zSprite.prototype.handlePress = function( aXPosition, aYPosition )
    {
        // override in prototype-extensions or instance
    };

    /**
     * invoked when the user releases touch of this (previously pressed) Sprite
     *
     * @protected
     */
    zSprite.prototype.handleRelease = function()
    {
        // override in prototype-extensions or instance
    };

    /**
     * invoked when user has clicked / tapped this Sprite, this indicates
     * the user has pressed and released within 250 ms
     *
     * @protected
     */
    zSprite.prototype.handleClick = function()
    {
        // override in prototype-extensions or instance
    };

    /**
     * move handler, invoked by the "handleInteraction"-method
     * to delegate drag logic
     *
     * @private
     *
     * @param {number} aXPosition
     * @param {number} aYPosition
     */
    zSprite.prototype.handleMove = function( aXPosition, aYPosition )
    {
        var theX = this._dragStartOffset.x + ( aXPosition - this._dragStartEventCoordinates.x );
        var theY = this._dragStartOffset.y + ( aYPosition - this._dragStartEventCoordinates.y );

        this.updatePosition( theX, theY );
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
    zSprite.prototype.handleInteraction = function( aEventX, aEventY, aEvent )
    {
        // first traverse the children of this sprite
        var foundInteractionInChild = false;

        var thisX       = this.getX();
        var thisY       = this.getY();
        var numChildren = this._children.length, theChild;

        if ( numChildren > 0 )
        {
            // reverse loop to first handle top layers
            theChild = this._children[ numChildren - 1 ];

            while ( theChild )
            {
                foundInteractionInChild = theChild.handleInteraction( aEventX, aEventY, aEvent );

                // child is higher in DisplayList, takes precedence over this parent
                if ( foundInteractionInChild ) {
                    return true;
                }
                theChild = theChild.last;
            }
        }

        if ( !this._interactive ) {
            return false;
        }

        // did we have a previous interaction and the 'up' event was fired?
        // unset this property or update the position in case the event is a move event
        if ( this.isDragging )
        {
            if ( aEvent.type === "touchend" ||
                 aEvent.type === "mouseup" )
            {
                this.isDragging = false;

                // in case we only handled this object for a short
                // period (250 ms), we assume it was clicked / tapped

                if ( Date.now() - this._dragStartTime < 250 )
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
            // this Sprites coordinates and dimensions are INSIDE the current event coordinates

            this.hover = true;

            // yes sir, we've got a match
            if ( !this.isDragging )
            {
                if ( aEvent.type === "touchstart" ||
                     aEvent.type === "mousedown" )
                {
                    this.isDragging     = true;
                    this._dragStartTime = Date.now();

                    this._dragStartOffset           = { "x" : this._bounds.left, "y" : this._bounds.top };
                    this._dragStartEventCoordinates = { "x" : aEventX, "y" : aEventY };

                    this.handlePress( aEventX, aEventY );
                    return true;
                }
            }
        }
        else {
            this.hover = false;
        }

        // the move handler is outside of the bounds check to
        // ensure we don't lose the handle by quickly moving around...

        if ( this._draggable && this.isDragging )
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
    zSprite.prototype.disposeInternal = function()
    {
        // in case this ZSprite was still on the ZCanvas, remove it

        if ( this._parent != null )
        {
            this._parent.removeChild( this );
        }

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
    zSprite.prototype.createImageFromSource = function( aImageSource )
    {
        this._imageReady   = false;    // we can only draw once the image has been fully loaded!
        this._image        = new Image();

        // prepare load callback via managed handler
        var eventHandler = new helpers.EventHandler();
        var loadCallback = function( e )
        {
            this._imageReady = true;
            eventHandler.dispose();  // will clean up listeners

        }.bind( this );

        eventHandler.addEventListener( this._image, "load", loadCallback );

        // load the image
        this._image.src = aImageSource;
    };

    /**
     * draw the bounding box for this Sprite onto the Canvas, can
     * be used when debugging
     *
     * @protected
     *
     * @param {CanvasRenderingContext2D} aCanvasContext to draw on
     */
    zSprite.prototype.drawOutline = function( aCanvasContext )
    {
        aCanvasContext.lineWidth   = 1;
        aCanvasContext.strokeStyle = '#FF0000';
        aCanvasContext.strokeRect( this.getX(), this.getY(), this.getWidth(), this.getHeight() )
    };

    return zSprite;

}));
