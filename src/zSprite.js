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

const OOP     = require( "./utils/OOP" );
const zLoader = require( "./zLoader" );

module.exports = zSprite;

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
 *
 * @param {number|{
 *            x: number,
 *            y: number,
 *            width: number,
 *            height: number,
 *            bitmap: Image|HTMLCanvasElement|string,
 *            collidable: boolean,
 *            mask: boolean,
 *            sheet: Array.<{ row: number, col: number, amount: number, fpt: 5 }>
 *
 *        }} x when numerical (legacy 7 argument constructor) the x-coordinate of this zSprite,
 *        when Object it should contain required properties width and height, with others optional
 *        (x and y will default to 0, 0 coordinate) see the description for width, height, bitmap,
 *        collidable and mask below)
 *
 *        "sheet" describes a list of separate animations inside given "bitmap"
 *
 *        When object, no further arguments will be
 *        processed by this constructor.
 *
 * @param {number=} y the y-coordinate of this zSprite, required when x is number
 * @param {number=} width of this zSprite's bounding box, required when x is number
 * @param {number=} height of this zSprite's bounding box, required when x is number
 * @param {Image|HTMLCanvasElement|string=} bitmap optional image, when given, no override of the "draw"-method is
 *            required, as it will render the image by default at the current coordinates and at the given width and
 *            height. value can be either: HTMLImageElement, HTMLCanvasElement or a string describing an Image.src
 *            (e.g. hyperlink to remote Image, base64 encoded String or Blob URL)
 *            when not defined, you must override the "draw"-method as otherwise this
 *            sprite won't render anything onto the zCanvas! *
 * @param {boolean=} collidable whether this zSprite can cause collisions with other Sprites
 * @param {boolean=} mask whether to use this zSprite as a mask for underlying content
 */
function zSprite( x, y, width, height, bitmap, collidable, mask ) {

    /* assertions */

    let opts;

    if ( typeof x === "number" ) {

        // legacy API

        opts = {
            x: x, y: y,
            width: width, height: height,
            bitmap: bitmap,
            collidable: collidable,
            mask: mask
        };
    }
    else if ( typeof x === "object" ) {

        // new API : Object based

        opts = x;
    }
    else {
        throw new Error( "zSprite must either be constructed using a definitions Object {} " +
            "or x, y, width, height, bitmap (optional), collidable (optional), mask (optional)" );
    }

    if ( typeof opts.width  !== "number" || typeof opts.height !== "number" )
        throw new Error( "cannot construct a zSprite without valid dimensions" );

    if ( typeof opts.x !== "number" )
        opts.x = 0;

    if ( typeof opts.y !== "number" )
        opts.y = 0;

    /* instance properties */

    /** @protected @type {Array.<zSprite>} */ this._children   = [];
    /** @protected @type {boolean} */         this._disposed = false;

    /**
     * whether this sprite can collide with others
     * 
     * @public
     * @type {boolean}
     */
    this.collidable = ( typeof opts.collidable === "boolean" ) ? opts.collidable : false;

    /**
     * indicates the user is currently hovering over this Sprite, note
     * this DOES NOT mean we are dragging (see _dragging) this value
     * will ALWAYS be false if the zSprite is not interactive
     *
     * @public
     * @type {boolean}
     */
    this.hover = false;

    /**
     *  whether this zSprites image contents should function as a mask
     * (for instance to obscure the contents of underlying zSprites)
     * 
     * @protected
     * @type {boolean}
     */
    this._mask = ( typeof opts.mask === "boolean" ) ? opts.mask : false;

    /**
     * rectangle describing this sprites bounds relative to the zCanvas
     * basically this describes its x- and y- coordinates and its dimensions
     *
     * @protected
     * @type {{ left: number, top: number, width: number, height: number }}
     */
    this._bounds = { "left" : 0, "top" : 0, "width" : opts.width, "height" : opts.height };

    /**
     * @protected
     * @type {zSprite|zCanvas}
     *
     * stores a reference to the parent zSprite/zCanvas containing this sprite
     */
    this._parent = null;

    /**
     * we use a linked list to quickly traverse the DisplayList
     * of the zCanvas, this property points to the previous sprite on the list
     *
     * @public
     * @type {zSprite}
     */
    this.last = null;

    /**
     * we use a linked list to quickly traverse the DisplayList
     * of the zCanvas, this property points to the next sprite on the list
     *
     * @public
     * @type {zSprite}
     */
    this.next = null;

    /**
     * reference to the zCanvas holding this zSprite
     * is null if the zSprite isn't present on the zCanvas' display list
     *
     * @public
     * @type {zCanvas}
     */
    zSprite.prototype.canvas = null;

    /**
     * @protected
     * @type {Image}
     */
    this._bitmap;

    /**
     * whether this zSprite is ready for drawing (will be false
     * when an Image source is used and the Image is still loading its data)
     *
     * @protected
     * @type {boolean}
     */
    this._bitmapReady = false;

    /**
     * @protected
     * @type {boolean}
     */
    this._draggable = false;

    /**
     * whether this zSprite can receive user interaction events, when
     * false this Sprite is omitted from "handleInteraction"-queries
     * executed when the user interacts with the parent StageCanvas element
     *
     * @protected
     * @type {boolean}
     */
    this._interactive = false;
    
    /**
     * whether to restrict this zSprites movement
     * to its constraints / zCanvas dimensions
     *
     * @protected
     * @type {boolean}
     */
    this._keepInBounds = false;

    /**
     * @public
     * @type {boolean}
     */
    this.isDragging = false;

    /* initialization */

    this.setX( opts.x );
    this.setY( opts.y );

    if ( opts.bitmap )
        this.setBitmap( opts.bitmap );

    if ( Array.isArray( opts.sheet ) && opts.sheet.length > 0 ) {

        if ( !opts.bitmap )
            throw new Error( "cannot use a spritesheet without a valid Bitmap" );

        /**
         * @public
         * @type {Array.<{ row: number, col: number, amount: number, fpt: 5 }>}
         */
        this.sheet = opts.sheet;

        /**
         * @protected
         * @type {Object}
         */
        this._animation = {
            type    : null,
            col     : 0,  // which horizontal tile in the sprite sheet is current
            maxCol  : 0,  // the maximum horizontal index that is allowed before the animation should loop
            fpt     : 0,  // "frames per tile" what is the max number of count before we switch tile
            counter : 0   // the frame counter that is increased on each frame render
        };

        this.switchAnimation( this.sheet[ 0 ]); // by default select first animation from list
    }
}

/* static methods */

/**
 * extend a given Function reference with the zSprite prototype, you
 * can use this to create custom zSprite extensions. From the extensions
 * you can call:
 *
 * InheritingPrototype.super( extensionInstance, methodName, var_args...)
 *
 * to call zSprite prototype functions from overriding function declarations
 * if you want to call the constructor, methodName is "constructor"
 *
 * @public
 * @param {!Function} extendingFunction reference to
 *        function which should inherit the zSprite prototype
 */
zSprite.extend = function( extendingFunction ) {

    OOP.extend( extendingFunction, zSprite );
};

/* public methods */

/**
 * whether the zSprite is draggable
 *
 * @public
 * @return {boolean}
 */
zSprite.prototype.getDraggable = function() {

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
zSprite.prototype.setDraggable = function( aValue, aKeepInBounds ) {

    this._draggable    = aValue;
    this._keepInBounds = aKeepInBounds || false;

    // if we want to drag this zSprite and it isn't interactive, set it as interactive
    // otherwise it will not receive any interaction events from the zCanvas

    if ( aValue && !this._interactive )
        this.setInteractive( true );
};

/**
 * @public
 *
 * @return {number}
 */
zSprite.prototype.getX = function() {

    return this._bounds.left;
};

/**
 * @public
 *
 * @param {number} aValue
 */
zSprite.prototype.setX = function( aValue ) {

    const delta       = aValue - this._bounds.left;
    this._bounds.left = this._constraint ? aValue + this._constraint.left : aValue;

    // as the offsets of the children are drawn relative to the Canvas, we
    // must update their offsets by the delta value too

    if ( this._children.length > 0 ) {

        let theChild = this._children[ 0 ];

        while ( theChild ) {
            if ( !theChild.isDragging )
                theChild.setX( theChild._bounds.left + delta );

            theChild = theChild.next;
        }
    }
};

/**
 * @public
 *
 * @return {number}
 */
zSprite.prototype.getY = function() {

    return this._bounds.top;
};

/**
 * @public
 *
 * @param {number} aValue
 */
zSprite.prototype.setY = function( aValue ) {

    const delta        = aValue - this._bounds.top;
    this._bounds.top = this._constraint ? aValue + this._constraint.top : aValue;

    // as the offsets of the children are drawn relative to the Canvas, we
    // must update their offsets by the delta value too

    if ( this._children.length > 0 ) {

        let theChild = this._children[ 0 ];

        while ( theChild ) {

            if ( !theChild.isDragging )
                theChild.setY( theChild._bounds.top + delta );

            theChild = theChild.next;
        }
    }
};

/**
 * @public
 * @return {number}
 */
zSprite.prototype.getWidth = function() {

    return this._bounds.width;
};

/**
 * @public
 * @param {number} aValue
 */
zSprite.prototype.setWidth = function( aValue ) {

    const prevWidth    = this._bounds.width || 0;
    this._bounds.width = aValue;

    // adjust the left offset so it remains relative to the
    // previous left offset for the old width

    if ( prevWidth !== 0 )
        this._bounds.left -= ( aValue * .5 - prevWidth * .5 );
};

/**
 * @public
 * @return {number}
 */
zSprite.prototype.getHeight = function() {

    return this._bounds.height;
};

/**
 * @public
 * @param {number} aValue
 */
zSprite.prototype.setHeight = function( aValue ) {

    const prevHeight    = this._bounds.height || 0;
    this._bounds.height = aValue;

    // adjust the top offset so it remains relative to the
    // previous top offset for the old height

    if ( prevHeight !== 0 )
        this._bounds.top -= ( aValue *.5 - prevHeight *.5 );
};

/**
 * update the position of this Sprite, where setX and setY operate directly on the
 * Sprites coordinates, this method validates the requested coordinates against the
 * defined constraints of this Sprite to ensure it remains within the constraints
 *
 * @public
 *
 * @param {number=} left optionally desired x-coordinate, defaults to current position
 * @param {number=} top optionally desired y-coordinate, defaults to current position
 * @param {number=} width optionally desired width, defaults to current size
 * @param {number=} height optionally desired width, defaults to current size
 */
zSprite.prototype.setBounds = function( left, top, width, height ) {

    if ( typeof left !== "number" )
        left = this._bounds.left;

    if ( typeof top !== "number" )
        top = this._bounds.top;

    if ( this._constraint ) {
        left -= this._constraint.left;
        top -= this._constraint.top;
    }
    else if ( !this.canvas ) {
        throw new Error( "cannot update position of a zSprite that has no constraint or is not added to a zCanvas" );
    }

    if ( typeof width === "number" )
        this._bounds.width = width;

    if ( typeof height === "number" )
        this._bounds.height = height;

    const thisWidth   = this._bounds.width;
    const thisHeight  = this._bounds.height;
    const stageWidth  = this._constraint ? this._constraint.width  : this.canvas.width;
    const stageHeight = this._constraint ? this._constraint.height : this.canvas.height;

    // keep within bounds ?

    if ( this._keepInBounds ) {

        // There is a very small chance that the bounds width/height compared to stage width/height
        // is only very slightly different, which will produce a positive numeric result very close to,
        // but not quite zero. To play it safe, we will limit it to a maximum of 0.
        const minX = Math.min( 0, -( thisWidth  - stageWidth  ));
        const minY = Math.min( 0, -( thisHeight - stageHeight ));
        const maxX = stageWidth  - thisWidth;
        const maxY = stageHeight - thisHeight;

        left = Math.min( maxX, Math.max( left, minX ));
        top = Math.min( maxY, Math.max( top, minY ));
    }
    else {

        /*if ( aXPosition < 0 ) {
         aXPosition = aXPosition - ( thisWidth  * .5 );
         }
         else*/ if ( left > stageWidth ) {
            left = left + ( thisWidth  * .5 );
        }

        /*if ( aYPosition < 0 ) {
         aYPosition = aYPosition - ( thisHeight * .5 );
         }
         else*/ if ( top > stageHeight ) {
            top = top + ( thisHeight * .5 );
        }
    }
    this.setX( left );
    this.setY( top );
};

/**
 * @public
 * @return {{ left: number, top: number, width: number, height: number }}
 */
zSprite.prototype.getBounds = function() {

    return this._bounds;
};

/**
 * whether this Sprite is interactive (should responds to user
 * interactions such as mouse hover, mouse clicks / touches, etc.)
 *
 * @public
 * @return {boolean}
 */
zSprite.prototype.getInteractive = function() {

    return this._interactive;
};

/**
 * toggle the interactive state of this zSprite
 *
 * @public
 *
 * @param {boolean} aValue
 */
zSprite.prototype.setInteractive = function( aValue ) {

    this._interactive = aValue;
};

/**
 * invoked on each render cycle before the draw-method is invoked, you can override this in your subclass
 * for custom logic / animation such as updating the state of this Object (like position, size, etc.)
 *
 * (!) this method will NOT fire if "onUpdate" was provided to the zCanvas, onUpdate can be used to
 * centralize all update logic (e.g. for game loops)
 *
 * @public
 * @param {number} aCurrentTimestamp the current timestamp
 *                 which can be used to create strict timed animations
 */
zSprite.prototype.update = function( aCurrentTimestamp ) {

    // override in prototype-extensions or instance
    // recursively update this sprites children :

    if ( this._children.length > 0 ) {

        let theSprite = this._children[ 0 ];

        while ( theSprite ) {
            theSprite.update( aCurrentTimestamp );
            theSprite = theSprite.next;
        }
    }

    // if this sprite has a spritesheet, progress its animation

    if ( this._animation )
        this.updateAnimation();
};

/**
 * invoked by the zCanvas whenever it renders a new frame / updates the on-screen contents
 * this is where the zSprite is responsible for rendering its contents onto the screen
 * By default, it will render it's Bitmap image at its described coordinates and dimensions but
 * you can override this method for your own custom rendering logic (e.g. draw custom shapes)
 *
 * @public
 * @param {CanvasRenderingContext2D} aCanvasContext to draw on
 */
zSprite.prototype.draw = function( aCanvasContext ) {

    // extend in subclass if you're drawing a custom object instead of a graphical Image asset
    // don't forget to draw the child display list when overriding this method!

    aCanvasContext.save();

    // zSprite acts as a mask for underlying Sprites ?

    if ( this._mask )
        aCanvasContext.globalCompositeOperation = 'destination-in';


    if ( this._bitmapReady ) {

        const bounds   = this._bounds,
              aniProps = this._animation;

        if ( !aniProps ) {

            // no spritesheet defined, draw entire Bitmap

            aCanvasContext.drawImage(
                this._bitmap,
                bounds.left,
                bounds.top,
                bounds.width,
                bounds.height
            );
        }
        else {

            // spritesheet defined, draw tile

            aCanvasContext.drawImage(
                this._bitmap,
                aniProps.col      * bounds.width,         // tile x offset
                aniProps.type.row * bounds.height,        // tile y offset
                bounds.width, bounds.height,              // tile width and height
                bounds.left, bounds.top, bounds.width, bounds.height
            );
        }
    }

    // draw this Sprites children onto the canvas

    if ( this._children.length > 0 ) {

        let theSprite = this._children[ 0 ];

        while ( theSprite ) {
            theSprite.draw( aCanvasContext );
            theSprite = theSprite.next;
        }
    }

    // restore canvas drawing operation so subsequent sprites draw as overlay

    if ( this._mask )
        aCanvasContext.globalCompositeOperation = 'source-over';

    aCanvasContext.restore();

    // draw an outline when in debug mode

    if ( this.canvas.DEBUG ) {
        this.drawOutline( aCanvasContext );
    }
};

/**
 * queries the bounding box of another sprite to check whether it overlaps the bounding box of this sprite, this
 * can be used as a fast method to detect collisions, though note it is less accurate than checking at the pixel
 * level as it will match the entire bounding box, and omit checking for (for instance) transparent areas!
 *
 * @public
 * @param {zSprite} aSprite the sprite to check against *
 * @return {boolean} whether a collision has been detected
 */
zSprite.prototype.collidesWith = function( aSprite ) {

    if ( aSprite === this )
        return false;
    
    const self = this._bounds, compare = aSprite.getBounds();
    
    return !(
        (( self.top + self.height ) < ( compare.top )) ||
        ( self.top > ( compare.top + compare.height )) ||
        (( self.left + self.width ) < compare.left ) ||
        ( self.left > ( compare.left + compare.width ))
    );
};

/**
 * get the intersection area where given aSprite collides with this sprite
 * returns null if no intersection occurs
 *
 * @public
 * @param {zSprite} aSprite
 * @return {{ left: number, top: number, width: number, height: number }|null}
 */
zSprite.prototype.getIntersection = function( aSprite ) {

    if ( this.collidesWith( aSprite )) {

        const self = this._bounds, compare = aSprite.getBounds();

        let x = Math.max( self.left, compare.left );
        let y = Math.max( self.top,  compare.top );
        let w = Math.min( self.left + self.width,  compare.width + compare.height ) - x;
        let h = Math.min( self.top  + self.height, compare.top   + compare.height ) - y;

        return { left: x, top: y, width: w, height: h };
    }
    return null;
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
zSprite.prototype.collidesWithEdge = function( aSprite, aEdge ) {

    if ( aSprite === this )
        return false;

    if ( isNaN( aEdge ) || aEdge < 0 || aEdge > 3 )
        throw new Error( "invalid argument for edge" );

    switch ( aEdge ) {
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
 * @public
 * @return {Image|HTMLCanvasElement|string}
 */
zSprite.prototype.getBitmap = function() {

    return this._bitmap;
};

/**
 * update / replace the Image contents of this zSprite, can be used
 * to swap spritesheets (for instance)
 *
 * @public
 * @param {Image|HTMLCanvasElement|string=} aImage image, can be either HTMLImageElement, HTMLCanvasElement
 *        or String (remote URL, base64 encoded string or Blob URL)
 * @param {number=} aOptWidth optional new width to use for this Sprites bounds
 * @param {number=} aOptHeight optional new width to use for this Sprites bounds
 */
zSprite.prototype.setBitmap = function( aImage, aOptWidth, aOptHeight ) {

    // swapping Bitmaps ? unset the ready state

    if ( this._bitmap !== aImage )
        this._bitmapReady = false;

    if ( !aImage ) {
        this._bitmap = null;
        return;
    }

    // update dimensions, when given

    const hasWidth  = ( typeof aOptWidth === "number" );
    const hasHeight = ( typeof aOptHeight === "number" );

    if ( hasWidth )
        this.setWidth( aOptWidth );

    if ( hasHeight )
        this.setHeight( aOptHeight );

    // make sure the image is still within bounds

    if ( self._keepInBounds && self.canvas && ( hasWidth || hasHeight )) {

        const minX = -( self._bounds.width  - self.canvas.getWidth() );
        const minY = -( self._bounds.height - self.canvas.getHeight() );

        if ( self._bounds.left > 0 )
            self._bounds.left = 0;

        else if ( self._bounds.left < minX )
            self._bounds.left = minX;

        if ( self._bounds.top > 0 )
            self._bounds.top = 0;

        else if ( self._bounds.top < minY )
            self._bounds.top = minY;
    }

    if ( aImage instanceof window.HTMLCanvasElement ) {

        // nothing to load, HTMLCanvasElement is ready for rendering

        this._bitmap      = aImage;
        this._bitmapReady = true;
    }
    else if ( aImage instanceof window.HTMLImageElement || typeof aImage === "string" ) {

        const self = this;

        zLoader.loadImage( aImage, ( aResult, aOptError ) => {

            if ( !( aOptError instanceof Error )) {

                self._bitmap      = aResult.image;
                self._bitmapReady = true;

                /** @protected @type {number} */ this._bitmapWidth  = aResult.size.width;
                /** @protected @type {number} */ this._bitmapHeight = aResult.size.height;
            }
            else {
                console.error( aOptError.message + " occurred. Could not setBitmap()" );
            }
        });
    }
    else {
        throw new Error( "expected HTMLImageElement, HTMLCanvasElement or String for Image source, " +
            "got " + aImage + " instead" );
    }
};

/**
 * set a reference to the parent sprite containing this one
 *
 * @override
 * @public
 *
 * @param {zSprite|zCanvas} aParent
 */
zSprite.prototype.setParent = function( aParent ) {

    this._parent = aParent;
};

/**
 * @public
 * @return {zSprite|zCanvas} parent
 */
zSprite.prototype.getParent = function() {

    return this._parent;
};

/**
 * set a reference to the zCanvas that is rendering this sprite
 *
 * @public
 *
 * @param {zCanvas} aCanvas
 */
zSprite.prototype.setCanvas = function( aCanvas ) {

    this.canvas = aCanvas;

    // no constraint specified ? use stage bounds

    if ( !this._constraint && aCanvas )
        this.setConstraint( 0, 0, aCanvas.getWidth(), aCanvas.getHeight() );
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
zSprite.prototype.setConstraint = function( aLeft, aTop, aWidth, aHeight ) {

    /**
     * rectangle describing this sprites restrictions (only applicable
     * to draggable zSprites to ensure they remain within these bounds)
     *
     * @protected
     * @type {{ left: number, top: number, width: number, height: number }}
     */
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
zSprite.prototype.getConstraint = function() {

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
zSprite.prototype.addChild = function( aChild ) {

    // create a linked list
    const numChildren = this._children.length;

    if ( numChildren > 0 ) {
        aChild.last      = this._children[ numChildren - 1 ];
        aChild.last.next = aChild;
        aChild.next      = null;
    }
    aChild.setCanvas( this.canvas );
    aChild.setParent( this );

    this._children.push( aChild );

    // request a render now the state of the canvas has changed

    if ( this.canvas )
        this.canvas.invalidate();

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
zSprite.prototype.removeChild = function( aChild ) {

    aChild.setParent( null );
    aChild.setCanvas( null );

    //aChild.dispose(); // no, we might like to re-use the child at a later stage!

    const childIndex = this._children.indexOf( aChild );
    if ( childIndex !== -1 )
        this._children.splice( childIndex, 1 );

    // update linked list

    const prevChild = aChild.last;
    const nextChild = aChild.next;

    if ( prevChild )
        prevChild.next = nextChild;

    if ( nextChild )
        nextChild.last = prevChild;

    aChild.last = aChild.next = null;

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
zSprite.prototype.getChildAt = function( index ) {

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
zSprite.prototype.removeChildAt = function( index ) {

    return this.removeChild( this.getChildAt( index ));
};

/**
 * @public
 * @return {number} the amount of children in this object's Display List
 */
zSprite.prototype.numChildren = function() {

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
zSprite.prototype.contains = function( aChild ) {

    return this._children.indexOf( aChild ) > -1;
};

/**
 * @public
 */
zSprite.prototype.dispose = function() {

    if ( this._disposed )
        return;

    this._disposed = true;

    // in case this ZSprite was still on the ZCanvas, remove it

    if ( this._parent )
        this._parent.removeChild( this );

    // dispose the children
    let i = this._children.length;

    while ( i-- ) {
        const theChild = this._children[ i ];
        theChild.dispose();
        theChild.next =
        theChild.last = null; // break references
    }
    this._children = [];
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
zSprite.prototype.handlePress = function( aXPosition, aYPosition ) {

    // override in prototype-extensions or instance
};

/**
 * invoked when the user releases touch of this (previously pressed) Sprite
 *
 * @protected
 *
 * @param {number} aXPosition position of the touch / cursor
 * @param {number} aYPosition position of the touch / cursor
 */
zSprite.prototype.handleRelease = function( aXPosition, aYPosition ) {

    // override in prototype-extensions or instance
};

/**
 * invoked when user has clicked / tapped this Sprite, this indicates
 * the user has pressed and released within 250 ms
 *
 * @protected
 */
zSprite.prototype.handleClick = function() {

    // override in prototype-extensions or instance
};

/**
 * move handler, invoked by the "handleInteraction"-method
 * to delegate drag logic
 *
 * @protected
 *
 * @param {number} aXPosition
 * @param {number} aYPosition
 */
zSprite.prototype.handleMove = function( aXPosition, aYPosition ) {

    const theX = this._dragStartOffset.x + ( aXPosition - this._dragStartEventCoordinates.x );
    const theY = this._dragStartOffset.y + ( aYPosition - this._dragStartEventCoordinates.y );

    this.setBounds( theX, theY );
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
zSprite.prototype.handleInteraction = function( aEventX, aEventY, aEvent ) {

    // first traverse the children of this sprite
    let foundInteractionInChild = false, theChild;

    const thisX       = this.getX(),
          thisY       = this.getY(),
          numChildren = this._children.length;

    if ( numChildren > 0 ) {

        // reverse loop to first handle top layers
        theChild = this._children[ numChildren - 1 ];

        while ( theChild ) {

            foundInteractionInChild = theChild.handleInteraction( aEventX, aEventY, aEvent );

            // child is higher in DisplayList, takes precedence over this parent
            if ( foundInteractionInChild )
                return true;

            theChild = theChild.last;
        }
    }

    if ( !this._interactive )
        return false;

    // did we have a previous interaction and the 'up' event was fired?
    // unset this property or update the position in case the event is a move event
    if ( this.isDragging ) {

        if ( aEvent.type === "touchend" ||
             aEvent.type === "mouseup" ) {

            this.isDragging = false;

            // in case we only handled this object for a short
            // period (250 ms), we assume it was clicked / tapped

            if ( Date.now() - this._dragStartTime < 250 )
                this.handleClick();

            this.handleRelease( aEventX, aEventY );
            return true;
        }
    }

    // evaluate if the event applies to this sprite by
    // matching the event offset with the Sprite bounds

    const coordinates = this._bounds;

    if ( aEventX >= thisX && aEventX <= ( thisX + coordinates.width ) &&
         aEventY >= thisY && aEventY <= ( thisY + coordinates.height )) {

        // this Sprites coordinates and dimensions are INSIDE the current event coordinates

        this.hover = true;

        // yes sir, we've got a match
        if ( !this.isDragging ) {

            if ( aEvent.type === "touchstart" ||
                 aEvent.type === "mousedown" ) {

                this.isDragging = true;

                /**
                 * timestamp of the moment drag was enabled, used for
                 * determining on release whether interaction was actually a tap/click
                 *
                 * @protected
                 * @type {number}
                 */
                this._dragStartTime = Date.now();

                /**
                 * this Sprites coordinates at the moment drag was enabled
                 *
                 * @protected
                 * @type {Object} w/ properties x and y
                 */
                this._dragStartOffset = { "x" : this._bounds.left, "y" : this._bounds.top };

                /**
                 * the coordinates of the click/touch event at the moment
                 * drag was enabled
                 *
                 * @protected
                 * @type {Object} w/ properties x and y
                 */
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

    if ( this._draggable && this.isDragging ) {

        this.handleMove( aEventX, aEventY );
        return true;
    }
    return false;
};

/* protected methods */

/**
 * switch the current animation that should be playing
 * from this zSprite tile sheet
 *
 * @public
 * @param {Object} tileObject present in the _tileSheet Object
 */
zSprite.prototype.switchAnimation = function( tileObject ) {

    const aniProps = this._animation;

    aniProps.type    = tileObject;
    aniProps.fpt     = tileObject.fpt;
    aniProps.maxCol  = tileObject.col + ( tileObject.amount - 1 );
    aniProps.col     = tileObject.col;
    aniProps.counter = 0;
};

/**
 * invoked by the update()-method prior to rendering
 * this will step between the frames in the tilesheet
 *
 * @protected
 */
zSprite.prototype.updateAnimation = function() {

    const aniProps = this._animation;

    if ( ++aniProps.counter === aniProps.fpt ) {
        ++aniProps.col;
        aniProps.counter = 0;
    }

    // loop animation by starting from first column

    if ( aniProps.col > aniProps.maxCol )
        aniProps.col = aniProps.type.col;
};

/**
 * draw the bounding box for this Sprite onto the Canvas, can
 * be used when debugging
 *
 * @protected
 * @param {CanvasRenderingContext2D} aCanvasContext to draw on
 */
zSprite.prototype.drawOutline = function( aCanvasContext ) {

    aCanvasContext.lineWidth   = 1;
    aCanvasContext.strokeStyle = '#FF0000';
    aCanvasContext.strokeRect( this.getX(), this.getY(), this.getWidth(), this.getHeight() )
};
