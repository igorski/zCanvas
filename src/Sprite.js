/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2013-2022 - https://www.igorski.nl
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
import Inheritance from "./utils/inheritance.js";
import Loader      from "./Loader.js";
import { isInsideViewport, calculateDrawRectangle } from "./utils/image-math.js";

const { min, max } = Math;
const HALF = .5;

/**
 * provides an API equivalent to the Flash Sprite / Display Object for manipulating "Objects" on a canvas element.
 *
 * the basic Sprite renders an Image onto a canvas and can capture interaction events, and be draggable
 *
 * inheriting classes that require custom logic should override the public "update"-method which is
 * invoked prior before the contents of this Sprite are rendered onto the canvas
 *
 * inheriting classes that have custom draw logic, should also override the public "draw"-method which is used
 * for drawing the Sprite's visual representation onto the canvas. This method is invoked on each draw cycle.
 *
 * @constructor
 * @param {{
 *            width: number,
 *            height: number,
 *            x?: number,
 *            y?: number,
 *            bitmap?: Image|HTMLCanvasElement|string,
 *            collidable?: boolean,
 *            interactive?: boolean,
 *            mask?: boolean,
 *            sheet?: Array<{ row: number, col: number, amount: number, fpt: 5 }>,
 *            sheetTileWidth?: number,
 *            sheetTileHeight?: number
 *        }}
 */
function Sprite({
    width, height,
    x = 0, y = 0, bitmap = null,
    collidable = false, interactive = false, mask = false,
    sheet = [], sheetTileWidth = 0, sheetTileHeight = 0
} = {}) {

    /* assertions */

    if ( width <= 0 || height <= 0 ) {
        throw new Error( "cannot construct a zSprite without valid dimensions" );
    }

    /* instance properties */

    /** @protected @type {Array<Sprite>} */ this._children   = [];
    /** @protected @type {boolean} */       this._disposed = false;

    /**
     * whether this sprite can collide with others
     *
     * @public
     * @type {boolean}
     */
    this.collidable = collidable;

    /**
     * indicates the user is currently hovering over this Sprite, note
     * this DOES NOT mean we are dragging (see _dragging) this value
     * will ALWAYS be false if the Sprite is not interactive
     *
     * @public
     * @type {boolean}
     */
    this.hover = false;

    /**
     *  whether this Sprites image contents should function as a mask
     * (for instance to obscure the contents of underlying Sprites)
     *
     * @protected
     * @type {boolean}
     */
    this._mask = mask;

    /**
     * rectangle describing this sprites bounds relative to the canvas
     * basically this describes its x- and y- coordinates and its dimensions
     *
     * @protected
     * @type {{ left: number, top: number, width: number, height: number }}
     */
    this._bounds = { left: 0, top: 0, width, height };

    /**
     * @protected
     * @type {Sprite|canvas}
     *
     * stores a reference to the parent Sprite/canvas containing this sprite
     */
    this._parent = null;

    /**
     * we use a linked list to quickly traverse the DisplayList
     * of the canvas, this property points to the previous sprite on the list
     *
     * @public
     * @type {Sprite}
     */
    this.last = null;

    /**
     * we use a linked list to quickly traverse the DisplayList
     * of the canvas, this property points to the next sprite on the list
     *
     * @public
     * @type {Sprite}
     */
    this.next = null;

    /**
     * reference to the canvas holding this Sprite
     * is null if the Sprite isn't present on the canvas' display list
     *
     * @public
     * @type {canvas}
     */
    this.canvas = null;

    /**
     * @protected
     * @type {HTMLImageElement|HTMLCanvasElement}
     */
    this._bitmap;

    /**
     * whether this Sprite is ready for drawing (will be false
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
     * whether to restrict this Sprites movement
     * to its constraints / canvas dimensions
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

    this.setX( x );
    this.setY( y );
    this.setInteractive( interactive );

    if ( bitmap ) {
        this.setBitmap( bitmap );
    }

    if ( Array.isArray( sheet ) && sheet.length > 0 ) {
        if ( !bitmap ) {
            throw new Error( "cannot use a spritesheet without a valid Bitmap" );
        }
        this.setSheet( sheet, sheetTileWidth, sheetTileHeight );
    }
}
export default Sprite;

/* static methods */

/**
 * extend a given Function reference with the Sprite prototype, you
 * can use this to create custom Sprite extensions. From the extensions
 * you can call:
 *
 * InheritingPrototype.super( extensionInstance, methodName, var_args...)
 *
 * to call Sprite prototype functions from overriding function declarations
 * if you want to call the constructor, methodName is "constructor"
 *
 * @public
 * @param {!Function} extendingFunction reference to
 *        function which should inherit the Sprite prototype
 * @returns {Sprite} subclass
 */
Sprite.extend = function( extendingFunction ) {
    Inheritance.extend( extendingFunction, Sprite );
};

/* public methods */

/**
 * whether the Sprite is draggable
 *
 * @public
 * @return {boolean}
 */
Sprite.prototype.getDraggable = function() {
    return this._draggable;
};

/**
 * toggle the draggable mode of this Sprite
 *
 * @public
 * @param {boolean} aValue whether we want to activate / deactivate the dragging mode
 * @param {Boolean=} aKeepInBounds optional, whether we should keep dragging within bounds
 *                   this will default to the bounds of the canvas, or can be a custom
 *                   restraint (see "setConstraint")
 */
Sprite.prototype.setDraggable = function( aValue, aKeepInBounds = false ) {
    this._draggable    = aValue;
    this._keepInBounds = this._constraint ? true : aKeepInBounds;

    // if we want to drag this Sprite and it isn't interactive, set it as interactive
    // otherwise it will not receive any interaction events from the canvas

    if ( aValue && !this._interactive ) {
        this.setInteractive( true );
    }
};

/**
 * @public
 * @return {number}
 */
Sprite.prototype.getX = function() {
    return this._bounds.left;
};

/**
 * @public
 * @param {number} aValue
 */
Sprite.prototype.setX = function( aValue ) {
    const delta       = aValue - this._bounds.left;
    this._bounds.left = this._constraint ? aValue + this._constraint.left : aValue;

    // as the offsets of the children are drawn relative to the Canvas, we
    // must update their offsets by the delta value too

    let theChild = this._children[ 0 ];
    while ( theChild ) {
        if ( !theChild.isDragging ) {
            theChild.setX( theChild._bounds.left + delta );
        }
        theChild = theChild.next;
    }
};

/**
 * @public
 * @return {number}
 */
Sprite.prototype.getY = function() {
    return this._bounds.top;
};

/**
 * @public
 * @param {number} aValue
 */
Sprite.prototype.setY = function( aValue ) {
    const delta        = aValue - this._bounds.top;
    this._bounds.top = this._constraint ? aValue + this._constraint.top : aValue;

    // as the offsets of the children are drawn relative to the Canvas, we
    // must update their offsets by the delta value too

    let theChild = this._children[ 0 ];
    while ( theChild ) {
        if ( !theChild.isDragging ) {
            theChild.setY( theChild._bounds.top + delta );
        }
        theChild = theChild.next;
    }
};

/**
 * @public
 * @return {number}
 */
Sprite.prototype.getWidth = function() {
    return this._bounds.width;
};

/**
 * @public
 * @param {number} aValue
 */
Sprite.prototype.setWidth = function( aValue ) {
    const prevWidth    = this._bounds.width || 0;
    this._bounds.width = aValue;

    // adjust the left offset so it remains relative to the
    // previous left offset for the old width

    if ( prevWidth !== 0 ) {
        this._bounds.left -= ( aValue * HALF - prevWidth * HALF );
    }
    this.invalidate();
};

/**
 * @public
 * @return {number}
 */
Sprite.prototype.getHeight = function() {
    return this._bounds.height;
};

/**
 * @public
 * @param {number} aValue
 */
Sprite.prototype.setHeight = function( aValue ) {
    const prevHeight    = this._bounds.height || 0;
    this._bounds.height = aValue;

    // adjust the top offset so it remains relative to the
    // previous top offset for the old height

    if ( prevHeight !== 0 ) {
        this._bounds.top -= ( aValue * HALF - prevHeight * HALF );
    }
    this.invalidate();
};

/**
 * update the position of this Sprite, where setX and setY operate directly on the
 * Sprites coordinates, this method validates the requested coordinates against the
 * defined constraints of this Sprite to ensure it remains within the constraints
 *
 * @public
 * @param {number} left desired x-coordinate
 * @param {number} top desired y-coordinate
 * @param {number=} width optionally desired width, defaults to current size
 * @param {number=} height optionally desired width, defaults to current size
 */
Sprite.prototype.setBounds = function( left, top, width, height ) {
    if ( this._constraint ) {
        left -= this._constraint.left;
        top  -= this._constraint.top;
    }
    else if ( !this.canvas ) {
        throw new Error( "cannot update position of a Sprite that has no constraint or is not added to a canvas" );
    }

    if ( typeof width === "number" ) {
        this._bounds.width = width;
    }

    if ( typeof height === "number" ) {
        this._bounds.height = height;
    }

    const thisWidth   = this._bounds.width;
    const thisHeight  = this._bounds.height;
    const stageWidth  = this._constraint ? this._constraint.width  : this.canvas.width;
    const stageHeight = this._constraint ? this._constraint.height : this.canvas.height;

    // keep within bounds ?

    if ( this._keepInBounds ) {

        // There is a very small chance that the bounds width/height compared to stage width/height
        // is only very slightly different, which will produce a positive numeric result very close to,
        // but not quite zero. To play it safe, we will limit it to a maximum of 0.
        const minX = min( 0, -( thisWidth  - stageWidth  ));
        const minY = min( 0, -( thisHeight - stageHeight ));
        const maxX = stageWidth  - thisWidth;
        const maxY = stageHeight - thisHeight;

        left = min( maxX, max( left, minX ));
        top  = min( maxY, max( top, minY ));
    }
    else {

        /*if ( aXPosition < 0 ) {
         aXPosition = aXPosition - ( thisWidth  * HALF );
         }
         else*/ if ( left > stageWidth ) {
            left = left + ( thisWidth  * HALF );
        }

        /*if ( aYPosition < 0 ) {
         aYPosition = aYPosition - ( thisHeight * HALF );
         }
         else*/ if ( top > stageHeight ) {
            top = top + ( thisHeight * HALF );
        }
    }
    this.setX( left );
    this.setY( top );
};

/**
 * @public
 * @return {{ left: number, top: number, width: number, height: number }}
 */
Sprite.prototype.getBounds = function() {
    return this._bounds;
};

/**
 * whether this Sprite is interactive (should responds to user
 * interactions such as mouse hover, mouse clicks / touches, etc.)
 *
 * @public
 * @return {boolean}
 */
Sprite.prototype.getInteractive = function() {
    return this._interactive;
};

/**
 * toggle whether this Sprite can receive user interaction events, when
 * false this Sprite is omitted from "handleInteraction"-queries
 * executed when the user interacts with the parent StageCanvas element
 *
 * @public
 * @param {boolean} aValue
 */
Sprite.prototype.setInteractive = function( aValue ) {
    /**
     * @protected
     * @type {boolean}
     */
    this._interactive = aValue;
};

/**
 * invoked on each render cycle before the draw-method is invoked, you can override this in your subclass
 * for custom logic / animation such as updating the state of this Object (like position, size, etc.)
 *
 * (!) this method will NOT fire if "onUpdate" was provided to the canvas, onUpdate can be used to
 * centralize all update logic (e.g. for game loops)
 *
 * @public
 * @param {DOMHighResTimeStamp} now the current timestamp relative
 *                              to the document time origin. Can be used
 *                              to perform strict timed operations.
 * @param {number} framesSinceLastUpdate the amount of frames that have elapsed
 *                 since the last update. This should usually equal 1 but can
 *                 be higher / lower at canvas frame rates other than the device framerate.
 *                 This value can be used to calculate appropriate values for timed operations
 *                 (e.g. animation speed) to compensate for dropped frames
 */
Sprite.prototype.update = function( now, framesSinceLastUpdate ) {

    // override in prototype-extensions or instance
    // recursively update this sprites children :

    let theSprite = this._children[ 0 ];
    while ( theSprite ) {
        theSprite.update( now );
        theSprite = theSprite.next;
    }

    // if this sprite has a spritesheet, progress its animation

    if ( this._animation ) {
        this.updateAnimation( framesSinceLastUpdate );
    }
};

/**
 * invoked by the canvas whenever it renders a new frame / updates the on-screen contents
 * this is where the Sprite is responsible for rendering its contents onto the screen
 * By default, it will render it's Bitmap image/spritesheet at its described coordinates and dimensions,
 * but you can override this method for your own custom rendering logic (e.g. drawing custom shapes)
 *
 * @public
 * @param {CanvasRenderingContext2D} canvasContext to draw on
 * @param {{
 *            left: number,
 *            top: number,
 *            width: number,
 *            height: number,
 *            right: number,
 *            bottom: number
 *        }|null} viewport optional viewport defining the currently visible canvas area
 */
Sprite.prototype.draw = function( canvasContext, viewport = null ) {

    // extend in subclass if you're drawing a custom object instead of a graphical Image asset
    // don't forget to draw the child display list when overriding this method!

    if ( !this.canvas ) {
        return;
    }

    const bounds = this._bounds;

    // only render when associated bitmap is ready
    let render = this._bitmapReady;
    if ( render && viewport ) {
        // ...and content is within visual bounds if a viewport was defined
        render = isInsideViewport( bounds, viewport );
    }

    canvasContext.save();

    // Sprite acts as a mask for underlying Sprites ?

    if ( this._mask ) {
        canvasContext.globalCompositeOperation = "destination-in";
    }

    if ( render ) {

        const aniProps = this._animation;
        let { left, top, width, height } = bounds;

        // note we use a fast rounding operation to prevent fractional values

        if ( !aniProps ) {

            // no spritesheet defined

            if ( viewport )
            {
                // bounds are defined, draw partial Bitmap
                const { src, dest } = calculateDrawRectangle( bounds, viewport );
                canvasContext.drawImage(
                    this._bitmap,
                    ( HALF + src.left )    << 0,
                    ( HALF + src.top )     << 0,
                    ( HALF + src.width )   << 0,
                    ( HALF + src.height )  << 0,
                    ( HALF + dest.left )   << 0,
                    ( HALF + dest.top )    << 0,
                    ( HALF + dest.width )  << 0,
                    ( HALF + dest.height ) << 0
                );
            } else {
                // no bounds defined, draw entire Bitmap
                canvasContext.drawImage(
                    this._bitmap,
                    ( HALF + left )   << 0,
                    ( HALF + top )    << 0,
                    ( HALF + width )  << 0,
                    ( HALF + height ) << 0
                );
            }
        }
        else {

            // spritesheet defined, draw tile

            const tileWidth  = aniProps.tileWidth  ? aniProps.tileWidth  : ( HALF + width )  << 0;
            const tileHeight = aniProps.tileHeight ? aniProps.tileHeight : ( HALF + height ) << 0;

            if ( viewport ) {
                left -= viewport.left;
                top  -= viewport.top;
            }

            canvasContext.drawImage(
                this._bitmap,
                aniProps.col      * tileWidth,  // tile x offset
                aniProps.type.row * tileHeight, // tile y offset
                tileWidth,
                tileHeight,
                ( HALF + left )   << 0,
                ( HALF + top )    << 0,
                ( HALF + width )  << 0,
                ( HALF + height ) << 0
            );
        }
    }

    // draw this Sprites children onto the canvas

    let theSprite = this._children[ 0 ];
    while ( theSprite ) {
        theSprite.draw( canvasContext, viewport );
        theSprite = theSprite.next;
    }

    // restore canvas drawing operation so subsequent sprites draw as overlay

    if ( this._mask ) {
        canvasContext.globalCompositeOperation = "source-over";
    }
    canvasContext.restore();

    // draw an outline when in debug mode

    if ( this.canvas.DEBUG ) {
        this.drawOutline( canvasContext );
    }
};

/**
 * evaluates whether given coordinate is within the Sprite bounds
 *
 * @public
 * @param {number} x coordinate
 * @param {number} y coordinate
 * @return {boolean}
 */
Sprite.prototype.insideBounds = function( x, y ) {
    const { left, top, width, height } = this._bounds;
    return x >= left && x <= ( left + width ) &&
           y >= top  && y <= ( top  + height );
};

/**
 * queries the bounding box of another sprite to check whether it overlaps the bounding box of this sprite, this
 * can be used as a fast method to detect collisions, though note it is less accurate than checking at the pixel
 * level as it will match the entire bounding box, and omit checking for (for instance) transparent areas!
 *
 * @public
 * @param {Sprite} aSprite the sprite to check against
 * @return {boolean} whether a collision has been detected
 */
Sprite.prototype.collidesWith = function( aSprite ) {
    if ( aSprite === this ) {
        return false;
    }
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
 * @param {Sprite} aSprite
 * @return {{ left: number, top: number, width: number, height: number }|null}
 */
Sprite.prototype.getIntersection = function( aSprite ) {
    if ( this.collidesWith( aSprite )) {
        const self = this._bounds, compare = aSprite.getBounds();

        const x = max( self.left, compare.left );
        const y = max( self.top,  compare.top );
        const w = min( self.left + self.width,  compare.width + compare.height ) - x;
        const h = min( self.top  + self.height, compare.top   + compare.height ) - y;

        return { left: x, top: y, width: w, height: h };
    }
    return null;
};

/**
 * queries the bounding box of another sprite to check whether its edges collide
 * with the edges of this sprite, this can be used as a fast method to detect whether
 * movement should be impaired on either side of this sprite (for instance wall collision detection)
 *
 * NOTE : ONLY query against results of canvas' "getChildrenUnderPoint"-method as for brevity (and speeds)
 * sake, we only check the desired plane, and not against the other axis.
 *
 * @public
 * @param {Sprite} aSprite the sprite to check against
 * @param {number} aEdge the edge to check 0 = left, 1 = above, 2 = right, 3 = below this is relative
 *                 to the edge of THIS sprite
 *
 * @return {boolean} whether collision with the given edge has been detected
 */
Sprite.prototype.collidesWithEdge = function( aSprite, aEdge ) {
    if ( aSprite === this ) {
        return false;
    }
    if ( isNaN( aEdge ) || aEdge < 0 || aEdge > 3 ) {
        throw new Error( "invalid argument for edge" );
    }

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
Sprite.prototype.getBitmap = function() {
    return this._bitmap;
};

/**
 * update / replace the Image contents of this Sprite, can be used
 * to swap spritesheets (for instance)
 *
 * @public
 * @param {HTMLImageElement|HTMLCanvasElement|string|null=} aImage image, can be
 *        either HTMLImageElement, HTMLCanvasElement or String (when string, either
 *        remote URL, base64 encoded string or Blob URL)
 * @param {number=} aOptWidth optional new width to use for this Sprites bounds
 * @param {number=} aOptHeight optional new width to use for this Sprites bounds
 * @return {Promise<void>}
 */
Sprite.prototype.setBitmap = function( aImage, aOptWidth, aOptHeight ) {
    const isCanvasElement = aImage instanceof window.HTMLCanvasElement;
    const isImageElement  = aImage instanceof window.HTMLImageElement;
    const isDataSource    = typeof aImage === "string";

    if ( !!aImage && ( !isCanvasElement && !isImageElement && !isDataSource )) {
        throw new Error( `expected HTMLImageElement, HTMLCanvasElement or String for Image source, got "${aImage}" instead` );
    }

    return new Promise(( resolve, reject ) => {
        // swapping Bitmaps ? unset the ready state

        if ( this._bitmap !== aImage ) {
            this._bitmapReady = false;
        }

        if ( !aImage ) {
            this._bitmap = null;
            return;
        }

        // update dimensions, when given

        const hasWidth  = ( typeof aOptWidth === "number" );
        const hasHeight = ( typeof aOptHeight === "number" );

        if ( hasWidth ) {
            this.setWidth( aOptWidth );
        }

        if ( hasHeight ) {
            this.setHeight( aOptHeight );
        }

        // make sure the image is still within bounds

        if ( this._keepInBounds && this.canvas && ( hasWidth || hasHeight )) {

            const minX = -( this._bounds.width  - this.canvas.getWidth() );
            const minY = -( this._bounds.height - this.canvas.getHeight() );

            if ( this._bounds.left > 0 ) {
                this._bounds.left = 0;
            } else if ( this._bounds.left < minX ) {
                this._bounds.left = minX;
            }

            if ( this._bounds.top > 0 ) {
                this._bounds.top = 0;
            } else if ( this._bounds.top < minY ) {
                this._bounds.top = minY;
            }
        }

        if ( isCanvasElement ) {

            // nothing to load, HTMLCanvasElement is ready for rendering

            this._bitmap      = aImage;
            this._bitmapReady = true;

            return resolve();
        }
        else {
            Loader.loadImage(
                isImageElement ? aImage.src : aImage, isImageElement ? aImage : null
            ).then(({ size, image }) => {
                this._bitmap          = image;
                this._bitmapReady     = true;

                /** @protected @type {number} */ this._bitmapWidth  = size.width;
                /** @protected @type {number} */ this._bitmapHeight = size.height;

                this.invalidate();

                resolve();
            }).catch( aOptError => {
                reject( new Error( `zSprite.setBitmap() "${aOptError?.message}" occurred.` ));
            });
        }
    });
};

/**
 * Define the sprite sheet for this Sprite to use tile based animation
 * from its Bitmap, use in conjunction with setBitmap()
 *
 * @public
 * @param {Array<{ row: number, col: number, amount: number, fpt: 5, onComplete: Function= }>} sheet
 * @param {number=} width optional width to use for a single tile, defaults to Sprite bounds width
 * @param {number=} height optional height to use for a single tile, defaults to Sprite bounds height
 */
Sprite.prototype.setSheet = function( sheet, width, height ) {
    /**
     * @protected
     * @type {Array<{ row: number, col: number, amount: number, fpt: 5, onComplete: Function= }>}
     */
    this._sheet = sheet;

    if ( !sheet ) {
        this._animation = null;
        return;
    }

    /**
     * @protected
     * @type {{
     *     type: string | null,
     *     col: number,
     *     maxCol: number,
     *     fpt: number,
     *     counter: number
     * }}
     */
    this._animation = {
        type       : null,
        col        : 0, // which horizontal tile in the sprite sheet is current
        maxCol     : 0, // the maximum horizontal index that is allowed before the animation should loop
        fpt        : 0, // "frames per tile" what is the max number of count before we switch tile
        counter    : 0  // the frame counter that is increased on each frame render
    };

    if ( typeof width  === "number" )
        this._animation.tileWidth = width;

    if ( typeof height === "number" )
        this._animation.tileHeight = height;

    this.switchAnimation( 0 ); // by default select first animation from list
};

/**
 * switch the current animation that should be playing from this Sprites tile sheet
 *
 * @public
 * @param {number} sheetIndex index of the animation as defined in the _tileSheet Array
 */
Sprite.prototype.switchAnimation = function( sheetIndex ) {

    const aniProps = this._animation, sheet = this._sheet[ sheetIndex ];

    aniProps.type       = sheet;
    aniProps.fpt        = sheet.fpt;
    aniProps.maxCol     = sheet.col + ( sheet.amount - 1 );
    aniProps.col        = sheet.col;
    aniProps.counter    = 0;
    aniProps.onComplete = sheet.onComplete;
};

/**
 * set a reference to the parent sprite containing this one
 *
 * @public
 * @param {Sprite|Canvas} aParent
 */
Sprite.prototype.setParent = function( aParent ) {
    this._parent = aParent;
};

/**
 * @public
 * @return {Sprite|Canvas} parent
 */
Sprite.prototype.getParent = function() {
    return this._parent;
};

/**
 * set a reference to the canvas that is rendering this sprite
 *
 * @public
 * @param {Canvas} aCanvas
 */
Sprite.prototype.setCanvas = function( aCanvas ) {
    this.canvas = aCanvas;
};

/**
 * a Sprite can be constrained in its movement (when dragging) to ensure it remains
 * within desired boundaries
 *
 * a parent constraint specifies the boundaries of this Sprites "container"
 * which can be used when dragging this sprite within boundaries. this constraint
 * will by default be equal to the canvas' dimensions (when "setCanvas" is invoked)
 * but this method can be invoked to override it to a custom Rectangle
 *
 * @public
 * @param {number} left
 * @param {number} top
 * @param {number} width
 * @param {number} height
 *
 * @return {{ left: number, top: number, width: number, height: number }} the generated constraint Rectangle
 */
Sprite.prototype.setConstraint = function( left, top, width, height) {
    /**
     * rectangle describing this sprites restrictions (only applicable
     * to draggable Sprites to ensure they remain within these bounds)
     *
     * @protected
     * @type {{ left: number, top: number, width: number, height: number }}
     */
    this._constraint = { left, top, width, height };

    this._bounds.left = max( left, this._bounds.left );
    this._bounds.top  = max( top,  this._bounds.top );

    this._keepInBounds = true;

    return this.getConstraint();
};

/**
 * @public
 * @return {{ left: number, top: number, width: number, height: number }}
 */
Sprite.prototype.getConstraint = function() {
    return this._constraint;
};

/**
 * append another Sprite to the display list of this sprite
 *
 * @public
 * @param {Sprite} aChild to append
 * @return {Sprite} this object - for chaining purposes
 */
Sprite.prototype.addChild = function( aChild ) {
    if ( this.contains( aChild )) {
        return this;
    }
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

    this.invalidate();

    return this;
};

/**
 * remove a child Sprite from this sprites display list
 *
 * @public
 *
 * @param {Sprite} aChild the child to remove
 * @return {Sprite} the removed child
 */
Sprite.prototype.removeChild = function( aChild ) {
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
 * get a child of this Sprite by its index in the Display List
 *
 * @public
 * @param {number} index of the object in the Display List
 * @return {Sprite} the Sprite present at the given index
 */
Sprite.prototype.getChildAt = function( index ) {
    return this._children[ index ];
};

/**
 * remove a child from this object's Display List at the given index
 *
 * @public
 * @param {number} index of the object to remove
 * @return {Sprite} the Sprite removed at the given index
 */
Sprite.prototype.removeChildAt = function( index ) {
    return this.removeChild( this.getChildAt( index ));
};

/**
 * @public
 * @return {number} the amount of children in this object's Display List
 */
Sprite.prototype.numChildren = function() {
    return this._children.length;
};

/**
 * check whether a given display object is present in this object's display list
 *
 * @public
 * @param {Sprite} aChild
 * @return {boolean}
 */
Sprite.prototype.contains = function( aChild ) {
    return aChild._parent === this;
};

/**
 * clean up all resources allocated to this Sprite
 *
 * @public
 */
Sprite.prototype.dispose = function() {
    if ( this._disposed ) {
        return;
    }
    this._disposed = true;

    // in case this Sprite was still on the canvas, remove it

    if ( this._parent ) {
        this._parent.removeChild( this );
    }

    // dispose the children
    let i = this._children.length;

    while ( i-- ) {
        const theChild = this._children[ i ];
        theChild.dispose();
        // break references
        theChild.next = null;
        theChild.last = null;
    }
    this._children = [];
};

/* event handlers */

/**
 * invoked when the user clicks / touches this sprite, NOTE : this
 * is a "down"-handler and indicates the sprite has just been touched
 *
 * @protected
 * @param {number} x position of the touch / cursor
 * @param {number} y position of the touch / cursor
 * @param {Event} event the original event that triggered this action
 */
Sprite.prototype.handlePress = function( x, y, event ) {
    // override in prototype-extensions or instance
};

/**
 * invoked when the user releases touch of this (previously pressed) Sprite
 *
 * @protected
 * @param {number} x position of the touch / cursor
 * @param {number} y position of the touch / cursor
 * @param {Event} event the original event that triggered this action
 */
Sprite.prototype.handleRelease = function( x, y, event ) {
    // override in prototype-extensions or instance
};

/**
 * invoked when user has clicked / tapped this Sprite, this indicates
 * the user has pressed and released within 250 ms
 *
 * @protected
 */
Sprite.prototype.handleClick = function() {
    // override in prototype-extensions or instance
};

/**
 * move handler, invoked by the "handleInteraction"-method
 * to delegate drag logic
 *
 * @protected
 * @param {number} x
 * @param {number} y
 * @param {Event} event the original event that triggered this action
 */
Sprite.prototype.handleMove = function( x, y, event ) {
    const theX = this._dragStartOffset.x + ( x - this._dragStartEventCoordinates.x );
    const theY = this._dragStartOffset.y + ( y - this._dragStartEventCoordinates.y );

    this.setBounds( theX, theY, this._bounds.width, this._bounds.height );
};

/**
 * invoked when the user interacts with the canvas, this method evaluates
 * the event data and checks whether it applies to this sprite and
 * when it does, applicable delegate handlers will be invoked on this Object
 * (see "handlePress", "handleRelease", "handleClick", "handleMove")
 *
 * do NOT override this method, override the individual "protected" handlers instead
 *
 * @public
 * @param {number} x the events X offset, passed for quick evaluation of position updates
 * @param {number} y the events Y offset, passed for quick evaluation of position updates
 * @param {Event} event the original event that triggered this action
 *
 * @return {boolean} whether this Sprite is handling the event
 */
Sprite.prototype.handleInteraction = function( x, y, event ) {
    // first traverse the children of this sprite
    let foundInteractionInChild = false, theChild;

    const numChildren = this._children.length;

    if ( numChildren > 0 ) {
        // reverse loop to first handle top layers
        theChild = this._children[ numChildren - 1 ];

        while ( theChild ) {
            foundInteractionInChild = theChild.handleInteraction( x, y, event );

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

    const { type } = event;

    if ( this._pressed && ( type === "touchend" || type === "mouseup" ))
    {
        this._pressed = false;

        if ( this.isDragging ) {
            this.isDragging = false;
        }

        // in case we only handled this object for a short
        // period (250 ms), we assume it was clicked / tapped

        if (( Date.now() - this._pressTime ) < 250 ) {
            this.handleClick();
        }
        this.handleRelease( x, y, event );

        return true;
    }

    // evaluate if the event applies to this sprite by
    // matching the event offset with the Sprite bounds

    if ( this.insideBounds( x, y )) {

        // this Sprites coordinates and dimensions are INSIDE the current event coordinates

        this.hover = true;

        // yes sir, we've got a match
        if ( type === "touchstart" || type === "mousedown" )
        {
            /**
             * timestamp of the moment the interaction down handler was triggered, used for
             * determining on release whether interaction was actually a tap/click
             *
             * @protected
             * @type {number}
             */
            this._pressTime = Date.now();

            /**
             * @protected
             * @type {boolean}
             */
            this._pressed = true;

            if ( this._draggable )
            {
                this.isDragging = true;

                /**
                 * this Sprites coordinates at the moment drag was enabled
                 *
                 * @protected
                 * @type {{ x:number, y: number }}
                 */
                this._dragStartOffset = {
                    x: this._bounds.left,
                    y: this._bounds.top
                };

                /**
                 * the coordinates of the click/touch event at the moment
                 * drag was enabled
                 *
                 * @protected
                 * @type {{ x:number, y: number }}
                 */
                this._dragStartEventCoordinates = { x, y };
            }
            this.handlePress( x, y, event );

            // mousedown fires after touchstart on Android, block double handling
            if ( type === "touchstart" ) {
                event.stopPropagation();
                event.preventDefault();
            }
            return true;
        }
    } else {
        this.hover = false;
    }

    // the move handler is outside of the bounds check to
    // ensure we don't lose the handle by quickly moving around...

    if ( this.isDragging ) {
        this.handleMove( x, y, event );
        return true;
    }
    return false;
};

/* protected methods */

/**
 * invoked by the update()-method prior to rendering
 * this will step between the frames in the tilesheet
 *
 * @protected
 * @param {number=} framesSinceLastRender
 */
Sprite.prototype.updateAnimation = function( framesSinceLastRender = 1 ) {
    const aniProps = this._animation;

    aniProps.counter += framesSinceLastRender;

    if ( aniProps.counter >= aniProps.fpt ) {
        ++aniProps.col;
        aniProps.counter = aniProps.counter % aniProps.fpt;
    }

    // loop animation by starting from first column

    if ( aniProps.col > aniProps.maxCol ) {
        aniProps.col = aniProps.type.col;

        // fire animation complete callback if defined
        if ( typeof aniProps.onComplete === "function" ) {
            aniProps.onComplete( this );
        }
    }
};

/**
 * Whenever a change has occurred, this Sprite can request an
 * invalidation of the Canvas to ensure the on screen representation
 * matches the latest state.
 *
 * @protected
 */
Sprite.prototype.invalidate = function() {
    this.canvas && this.canvas.invalidate();
};

/**
 * draw the bounding box for this Sprite onto the Canvas, can
 * be used when debugging
 *
 * @protected
 * @param {CanvasRenderingContext2D} canvasContext to draw on
 */
Sprite.prototype.drawOutline = function( canvasContext ) {
    canvasContext.lineWidth   = 1;
    canvasContext.strokeStyle = "#FF0000";
    canvasContext.strokeRect( this.getX(), this.getY(), this.getWidth(), this.getHeight() )
};
