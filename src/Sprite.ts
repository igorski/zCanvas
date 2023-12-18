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
import Loader from "./Loader";
import type Canvas from "./Canvas";
import type { Point, Rectangle, SpriteSheet, SpriteSource, Viewport } from "./definitions/types";
import { type IRenderer } from "./rendering/IRenderer";
import { isInsideViewport, calculateDrawRectangle } from "./utils/image-math";

const { min, max } = Math;
const HALF = 0.5;

interface SpriteProps {
    width: number,
    height: number,
    x?: number,
    y?: number,
    bitmap?: ImageBitmap | HTMLCanvasElement | HTMLImageElement;
    collidable?: boolean,
    interactive?: boolean,
    mask?: boolean,
    sheet?: SpriteSheet[],
    sheetTileWidth?: number,
    sheetTileHeight?: number,
}

/**
 * provides an API derived from the Flash Sprite / Display Object for manipulating "Objects" on a canvas element.
 *
 * the basic Sprite renders an Image onto a canvas and can capture interaction events, and be draggable
 *
 * inheriting classes that require custom logic should override the public "update"-method which is
 * invoked prior before the contents of this Sprite are rendered onto the canvas
 *
 * inheriting classes that have custom draw logic, should also override the public "draw"-method which is used
 * for drawing the Sprite's visual representation onto the canvas. This method is invoked on each draw cycle.
 */
export default class Sprite {

    public collidable: boolean; // whether this sprite can collide with others
    public hover = false; // whether user is currently hovering the sprite
    public isDragging = false;
    public canvas: Canvas | undefined;
    public last: Sprite | undefined;
    public next: Sprite | undefined;

    protected _bounds: Rectangle; // bounding box relative to the Canvas
    protected _children: Sprite[]  = [];
    protected _parent: Sprite | Canvas | undefined;
    protected _disposed = false;
    protected _mask = false; // whether Sprite masks underlying Canvas content
    protected _interactive = false;
    protected _draggable = false;
    protected _keepInBounds = false;
    protected _constraint: Rectangle | undefined;
    protected _sheet: SpriteSheet[] | undefined;
    protected _animation: {
        type?: SpriteSheet;
        col: number;
        maxCol: number;
        fpt: number;
        counter: number;
        tileWidth: number;
        tileHeight: number;
        onComplete?: ( sprite: Sprite ) => void;
    } | undefined;

    protected _bitmap: ImageBitmap;
    protected _bitmapReady = false;

    protected _pressTime: number;
    protected _pressed = false;
    protected _dragStartOffset: Point; // coordinates of this Sprite at the moment drag was started
    protected _dragStartEventCoordinates: Point; // coordinates of the event at the moment drag was started

    constructor({
        width,
        height,
        x = 0,
        y = 0,
        bitmap = undefined,
        collidable = false,
        interactive = false,
        mask = false,
        sheet = [],
        sheetTileWidth = 0,
        sheetTileHeight = 0
    }: SpriteProps = { width: 64, height: 64 } ) {
        /* assertions */

        if ( width <= 0 || height <= 0 ) {
            throw new Error( "cannot construct a zSprite without valid dimensions" );
        }

        this.collidable = collidable;

        this._mask = mask;
        this._bounds = { left: 0, top: 0, width, height };

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

    /* public methods */

    /**
     * whether the Sprite is draggable
     */
    getDraggable(): boolean {
        return this._draggable;
    }

    /**
     * toggle the draggable mode of this Sprite
     *
     * @param {boolean} draggable whether we want to activate / deactivate the dragging mode
     * @param {Boolean=} keepInBounds optional, whether we should keep dragging within bounds
     *                   this will default to the bounds of the canvas, or can be a custom
     *                   restraint (see "setConstraint")
     */
    setDraggable( draggable: boolean, keepInBounds = false ): void {
        this._draggable    = draggable;
        this._keepInBounds = this._constraint ? true : keepInBounds;

        // if we want to drag this Sprite and it isn't interactive, set it as interactive
        // otherwise it will not receive any interaction events from the canvas

        if ( draggable && !this._interactive ) {
            this.setInteractive( true );
        }
    }

    getX(): number {
        return this._bounds.left;
    }

    setX( value: number ): void {
        const delta       = value - this._bounds.left;
        this._bounds.left = this._constraint ? value + this._constraint.left : value;

        // as the offsets of the children are drawn relative to the Canvas, we
        // must update their offsets by the delta value too

        let theChild = this._children[ 0 ];
        while ( theChild ) {
            if ( !theChild.isDragging ) {
                theChild.setX( theChild._bounds.left + delta );
            }
            theChild = theChild.next;
        }
    }

    getY(): number {
        return this._bounds.top;
    }

    setY( value: number ): void {
        const delta        = value - this._bounds.top;
        this._bounds.top = this._constraint ? value + this._constraint.top : value;

        // as the offsets of the children are drawn relative to the Canvas, we
        // must update their offsets by the delta value too

        let theChild = this._children[ 0 ];
        while ( theChild ) {
            if ( !theChild.isDragging ) {
                theChild.setY( theChild._bounds.top + delta );
            }
            theChild = theChild.next;
        }
    }

    getWidth(): number {
        return this._bounds.width;
    }

    setWidth( value: number ): void {
        const prevWidth = this._bounds.width || 0;
        if ( prevWidth === value ) {
            return;
        }
        this._bounds.width = value;

        // adjust the left offset so it remains relative to the
        // previous left offset for the old width

        if ( prevWidth !== 0 ) {
            this._bounds.left -= ( value * HALF - prevWidth * HALF );
        }
        this.invalidate();
    }

    getHeight(): number {
        return this._bounds.height;
    }

    setHeight( value: number ): void {
        const prevHeight = this._bounds.height || 0;
        if ( prevHeight === value ) {
            return;
        }
        this._bounds.height = value;

        // adjust the top offset so it remains relative to the
        // previous top offset for the old height

        if ( prevHeight !== 0 ) {
            this._bounds.top -= ( value * HALF - prevHeight * HALF );
        }
        this.invalidate();
    }

    /**
     * update the position of this Sprite, where setX and setY operate directly on the
     * Sprites coordinates, this method validates the requested coordinates against the
     * defined constraints of this Sprite to ensure it remains within the constraints
     *
     * @param {number} left desired x-coordinate
     * @param {number} top desired y-coordinate
     * @param {number=} width optionally desired width, defaults to current size
     * @param {number=} height optionally desired width, defaults to current size
     */
    setBounds( left: number, top: number, width?: number, height?: number ): void {
        if ( this._constraint ) {
            left -= this._constraint.left;
            top  -= this._constraint.top;
        }
        else if ( !this.canvas ) {
            throw new Error( "cannot update position of a Sprite that has no constraint or is not added to a canvas" );
        }

        let invalidateSize = false;

        if ( typeof width === "number" ) {
            invalidateSize = this._bounds.width !== width;
            this._bounds.width = width;
        }

        if ( typeof height === "number" ) {
            invalidateSize = invalidateSize || this._bounds.height !== height;
            this._bounds.height = height;
        }

        const thisWidth   = this._bounds.width;
        const thisHeight  = this._bounds.height;
        const stageWidth  = this._constraint ? this._constraint.width  : this.canvas.getWidth();
        const stageHeight = this._constraint ? this._constraint.height : this.canvas.getHeight();

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

        if ( invalidateSize ) {
            this.invalidate();
        }
    }

    getBounds(): Rectangle {
        return this._bounds;
    };

    /**
     * whether this Sprite is interactive (should responds to user
     * interactions such as mouse hover, mouse clicks / touches, etc.)
     */
    getInteractive(): boolean {
        return this._interactive;
    }

    /**
     * toggle whether this Sprite can receive user interaction events, when
     * false this Sprite is omitted from "handleInteraction"-queries
     * executed when the user interacts with the parent StageCanvas element
     */
    setInteractive( value: boolean ): void {
        this._interactive = value;
    }

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
    update( now: DOMHighResTimeStamp, framesSinceLastUpdate: number ): void {

        // override in prototype-extensions or instance
        // recursively update this sprites children :

        let theSprite = this._children[ 0 ];
        while ( theSprite ) {
            theSprite.update( now, framesSinceLastUpdate );
            theSprite = theSprite.next;
        }

        // if this sprite has a spritesheet, progress its animation

        if ( this._animation ) {
            this.updateAnimation( framesSinceLastUpdate );
        }
    }

    /**
     * invoked by the canvas whenever it renders a new frame / updates the on-screen contents
     * this is where the Sprite is responsible for rendering its contents onto the screen
     * By default, it will render it's Bitmap image/spritesheet at its described coordinates and dimensions,
     * but you can override this method for your own custom rendering logic (e.g. drawing custom shapes)
     *
     * @param {IRenderer} renderer to draw on
     * @param {Viewport=} viewport optional viewport defining the currently visible canvas area
     */
    draw( renderer: IRenderer, viewport?: Viewport ): void {

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

        let saveState = this._mask; // save() and restore() come with a performance hit, omit when possible

        if ( saveState ) {
            renderer.save();
        }

        // Sprite acts as a mask for underlying Sprites ?

        if ( this._mask ) {
            renderer.setBlendMode( "destination-in" );
        }

        if ( render ) {

            const aniProps = this._animation;
            let { left, top, width, height } = bounds;

            // note we use a fast rounding operation to prevent fractional values

            if ( !aniProps ) {

                // no spritesheet defined

                if ( viewport ) {
                    // bounds are defined, draw partial Bitmap
                    const { src, dest } = calculateDrawRectangle( bounds, viewport );
                    renderer.drawImageCropped(
                        this._bitmap, // TODO via Cache key identifier!!
                        src.left, src.top, src.width, src.height, dest.left, dest.top, dest.width, dest.height
                    );
                } else {
                    renderer.drawImage(
                        this._bitmap, // TODO via Cache key identifier!!
                        left, top, width, height
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

                renderer.drawImageCropped(
                    this._bitmap, // TODO via Cache key identifier
                    aniProps.col      * tileWidth,  // tile x offset
                    aniProps.type.row * tileHeight, // tile y offset
                    tileWidth, tileHeight,
                    left, top, width, height
                );
            }
        }

        // draw this Sprites children onto the canvas

        let theSprite = this._children[ 0 ];
        while ( theSprite ) {
            theSprite.draw( renderer, viewport );
            theSprite = theSprite.next;
        }

        // restore canvas drawing operation so subsequent sprites draw as overlay

        if ( this._mask ) {
            renderer.setBlendMode( "source-over" ); // @todo doesn't restore fix this??
        }

        // draw an outline when in debug mode

        if ( this.canvas.DEBUG ) {
            renderer.drawRect( this.getX(), this.getY(), this.getWidth(), this.getHeight(), "#FF0000", "stroke" );
        }

        if ( saveState ) {
            renderer.restore();
        }
    }

    /**
     * evaluates whether given coordinate is within the Sprite bounds
     */
    insideBounds( x: number, y: number ): boolean {
        const { left, top, width, height } = this._bounds;
        return x >= left && x <= ( left + width ) && y >= top  && y <= ( top  + height );
    }

    /**
     * queries the bounding box of another sprite to check whether it overlaps the bounding box of this sprite, this
     * can be used as a fast method to detect collisions, though note it is less accurate than checking at the pixel
     * level as it will match the entire bounding box, and omit checking for (for instance) transparent areas!
     *
     * @param {Sprite} sprite the sprite to check against
     * @return {boolean} whether a collision has been detected
     */
    collidesWith( sprite: Sprite ): boolean {
        if ( sprite === this ) {
            return false;
        }
        const self = this._bounds, compare = sprite.getBounds();

        return !(
            (( self.top + self.height ) < ( compare.top )) ||
            ( self.top > ( compare.top + compare.height )) ||
            (( self.left + self.width ) < compare.left ) ||
            ( self.left > ( compare.left + compare.width ))
        );
    }

    /**
     * get the intersection area where given aSprite collides with this sprite
     * returns undefined if no intersection occurs
     */
    getIntersection( sprite: Sprite ): Rectangle | undefined {
        if ( this.collidesWith( sprite )) {
            const self = this._bounds, compare = sprite.getBounds();

            const x = max( self.left, compare.left );
            const y = max( self.top,  compare.top );
            const w = min( self.left + self.width,  compare.width + compare.height ) - x;
            const h = min( self.top  + self.height, compare.top   + compare.height ) - y;

            return { left: x, top: y, width: w, height: h };
        }
        return undefined;
    }

    /**
     * queries the bounding box of another sprite to check whether its edges collide
     * with the edges of this sprite, this can be used as a fast method to detect whether
     * movement should be impaired on either side of this sprite (for instance wall collision detection)
     *
     * NOTE : ONLY query against results of canvas' "getChildrenUnderPoint"-method as for brevity (and speeds)
     * sake, we only check the desired plane, and not against the other axis.
     *
     * @public
     * @param {Sprite} sprite the sprite to check against
     * @param {number} edge the edge to check 0 = left, 1 = above, 2 = right, 3 = below this is relative
     *                 to the edge of THIS sprite
     *
     * @return {boolean} whether collision with the given edge has been detected
     */
    collidesWithEdge( sprite: Sprite, edge: 0 | 1 | 2 | 3 ): boolean {
        if ( sprite === this ) {
            return false;
        }
        if ( isNaN( edge ) || edge < 0 || edge > 3 ) {
            throw new Error( "invalid argument for edge" );
        }

        switch ( edge ) {
            case 0: // left
                return ( this.getX() <= sprite.getX() + sprite.getWidth() );

            case 1: // above
                return ( this.getY() <= sprite.getY() + sprite.getHeight() );

            case 2: // right
                return ( this.getX() + this.getWidth() <= sprite.getX() );

            case 3: // below
                return ( this.getY() + this.getHeight() >= sprite.getY() );
        }
        return false;
    }

    getBitmap(): ImageBitmap {
        return this._bitmap;
    }

    /**
     * update / replace the Image contents of this Sprite, can be used
     * to swap spritesheets (for instance)
     *
     * @param {SpriteSource|null} bitmap
     * @param {number=} width optional new width to use for this Sprites bounds
     * @param {number=} height optional new width to use for this Sprites bounds
     */
    setBitmap( image: SpriteSource | null, width?: number, height?: number ): Promise<void> {
        const isCanvasElement = image instanceof window.HTMLCanvasElement;
        const isImageElement  = image instanceof window.HTMLImageElement;
        const isDataSource    = typeof image === "string";

        if ( !!image && ( !isCanvasElement && !isImageElement && !isDataSource )) {
            throw new Error( `expected HTMLImageElement, HTMLCanvasElement or String for Image source, got "${image}" instead` );
        }

        return new Promise(( resolve, reject ) => {
            this._bitmapReady = false; // swapping Bitmaps ? unset the ready state

            if ( !image ) {
                this._bitmap = undefined;
                return;
            }

            // update dimensions, when given

            const hasWidth  = ( typeof width  === "number" );
            const hasHeight = ( typeof height === "number" );

            if ( hasWidth ) {
                this.setWidth( width );
            }

            if ( hasHeight ) {
                this.setHeight( height );
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

                this._bitmap      = image; // TODO make CacheKey it needs to be accessible TO THE RENDERER !!!
                this._bitmapReady = true;

                this.invalidate();

                return resolve();
            }
            else {
                Loader.loadImage(
                    isImageElement ? image.src : image, isImageElement ? image : null
                ).then(({ size, image }) => {
                    this._bitmap  = image;
                    this._bitmapReady = true;

                    this.invalidate();
                    resolve();
                }).catch( aOptError => {
                    reject( new Error( `zSprite.setBitmap() "${aOptError?.message}" occurred.` ));
                });
            }
        });
    }

    /**
     * Define the sprite sheet for this Sprite to use tile based animation
     * from its Bitmap, use in conjunction with setBitmap()
     *
     * @param {SpriteSheet[]} sheet
     * @param {number=} width optional width to use for a single tile, defaults to Sprite bounds width
     * @param {number=} height optional height to use for a single tile, defaults to Sprite bounds height
     */
    setSheet( sheet: SpriteSheet[], width?: number, height?: number ): void {
        this._sheet = sheet;

        if ( !sheet ) {
            this._animation = undefined;
            return;
        }
        this._animation = {
            type       : null,
            col        : 0, // which horizontal tile in the sprite sheet is current
            maxCol     : 0, // the maximum horizontal index that is allowed before the animation should loop
            fpt        : 0, // "frames per tile" what is the max number of count before we switch tile
            counter    : 0, // the frame counter that is increased on each frame render
            tileWidth  : this.getWidth(),
            tileHeight : this.getHeight(),
        };

        if ( typeof width  === "number" ) {
            this._animation.tileWidth = width;
        }
        if ( typeof height === "number" ) {
            this._animation.tileHeight = height;
        }
        this.switchAnimation( 0 ); // by default select first animation from list
    }

    /**
     * switch the current animation that should be playing from this Sprites tile sheet
     *
     * @param {number} sheetIndex index of the animation as defined in the _tileSheet Array
     */
    switchAnimation( sheetIndex: number ): void {
        const aniProps = this._animation;
        const sheet    = this._sheet[ sheetIndex ];

        aniProps.type       = sheet;
        aniProps.fpt        = sheet.fpt;
        aniProps.maxCol     = sheet.col + ( sheet.amount - 1 );
        aniProps.col        = sheet.col;
        aniProps.counter    = 0;
        aniProps.onComplete = sheet.onComplete;
    }

    /**
     * set a reference to the parent sprite containing this one
     */
    setParent( parent: Sprite | Canvas | undefined ): void {
        this._parent = parent;
    }

    getParent(): Sprite | Canvas | undefined {
        return this._parent;
    }

    /**
     * set a reference to the canvas that is rendering this sprite
     */
    setCanvas( canvas: Canvas ): void {
        this.canvas = canvas;
        for ( const sprite of this._children ) {
            sprite.setCanvas( canvas );
        }
    }

    /**
     * a Sprite can be constrained in its movement (when dragging) to ensure it remains
     * within desired boundaries
     *
     * a parent constraint specifies the boundaries of this Sprites "container"
     * which can be used when dragging this sprite within boundaries. this constraint
     * will by default be equal to the canvas' dimensions (when "setCanvas" is invoked)
     * but this method can be invoked to override it to a custom Rectangle
     */
    setConstraint( left: number, top: number, width: number, height: number ): Rectangle {
        this._constraint = { left, top, width, height };

        this._bounds.left = max( left, this._bounds.left );
        this._bounds.top  = max( top,  this._bounds.top );

        this._keepInBounds = true;

        return this.getConstraint();
    }

    getConstraint(): Rectangle {
        return this._constraint;
    }

    /**
     * append another Sprite to the display list of this sprite
     *
     * @param {Sprite} child to append
     * @return {Sprite} this object - for chaining purposes
     */
    addChild( child: Sprite ): Sprite {
        if ( this.contains( child )) {
            return this;
        }
        // create a linked list
        const numChildren = this._children.length;

        if ( numChildren > 0 ) {
            child.last      = this._children[ numChildren - 1 ];
            child.last.next = child;
            child.next      = undefined;
        }
        child.setCanvas( this.canvas );
        child.setParent( this );

        this._children.push( child );

        // request a render now the state of the canvas has changed

        this.invalidate();

        return this;
    }

    /**
     * remove a child Sprite from this sprites display list
     *
     * @param {Sprite} child the child to remove
     * @return {Sprite} the removed child
     */
    removeChild( child: Sprite ): Sprite {
        child.setParent( undefined );
        child.setCanvas( undefined );

        //aChild.dispose(); // no, we might like to re-use the child at a later stage!

        const childIndex = this._children.indexOf( child );
        if ( childIndex !== -1 ) {
            this._children.splice( childIndex, 1 );
        }

        // update linked list

        const prevChild = child.last;
        const nextChild = child.next;

        if ( prevChild ) {
            prevChild.next = nextChild;
        }
        if ( nextChild ) {
            nextChild.last = prevChild;
        }
        child.last = child.next = undefined;

        // request a render now the state of the canvas has changed

        this.invalidate();

        return child;
    }

    /**
     * get a child of this Sprite by its index in the Display List
     *
     * @param {number} index of the object in the Display List
     * @return {Sprite} the Sprite present at the given index
     */
    getChildAt( index: number ): Sprite | undefined {
        return this._children[ index ];
    }

    /**
     * remove a child from this object's Display List at the given index
     *
     * @param {number} index of the object to remove
     * @return {Sprite} the Sprite removed at the given index
     */
    removeChildAt( index: number ): Sprite | undefined {
        return this.removeChild( this.getChildAt( index ));
    }

    /**
     * @return {number} the amount of children in this object's Display List
     */
    numChildren(): number {
        return this._children.length;
    }

    getChildren(): Sprite[] {
        return this._children;
    }

    /**
     * check whether a given display object is present in this object's display list
     */
    contains( child: Sprite ): boolean {
        return child._parent === this;
    }

    /**
     * clean up all resources allocated to this Sprite
     */
    dispose(): void {
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
            theChild.next = undefined;
            theChild.last = undefined;
        }
        this._children = [];
    }

    /* event handlers */

    /**
     * invoked when the user clicks / touches this sprite, NOTE : this
     * is a "down"-handler and indicates the sprite has just been touched
     *
     * @param {number} x position of the touch / cursor
     * @param {number} y position of the touch / cursor
     * @param {Event} event the original event that triggered this action
     */
    protected handlePress( x: number, y: number, event: Event ): void {
        // override in inheriting classes
    }

    /**
     * invoked when the user releases touch of this (previously pressed) Sprite
     *
     * @param {number} x position of the touch / cursor
     * @param {number} y position of the touch / cursor
     * @param {Event} event the original event that triggered this action
     */
    protected handleRelease( x: number, y: number, event: Event ): void {
        // override in inheriting classes
    }

    /**
     * invoked when user has clicked / tapped this Sprite, this indicates
     * the user has pressed and released within 250 ms
     */
    protected handleClick(): void {
        // override in inheriting classes
    }

    /**
     * move handler, invoked by the "handleInteraction"-method
     * to delegate drag logic
     */
    protected handleMove( x: number, y: number, event: Event ): void {
        const theX = this._dragStartOffset.x + ( x - this._dragStartEventCoordinates.x );
        const theY = this._dragStartOffset.y + ( y - this._dragStartEventCoordinates.y );

        this.setBounds( theX, theY, this._bounds.width, this._bounds.height );
    }

    /**
     * invoked when the user interacts with the canvas, this method evaluates
     * the event data and checks whether it applies to this sprite and
     * when it does, applicable delegate handlers will be invoked on this Object
     * (see "handlePress", "handleRelease", "handleClick", "handleMove")
     *
     * do NOT override this method, override the individual "protected" handlers instead
     *
     * @param {number} x the events X offset, passed for quick evaluation of position updates
     * @param {number} y the events Y offset, passed for quick evaluation of position updates
     * @param {Event} event the original event that triggered this action
     * @return {boolean} whether this Sprite is handling the event
     */
    handleInteraction( x: number, y: number, event: Event ): boolean {
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
                 */
                this._pressTime = Date.now();
                this._pressed = true;

                if ( this._draggable ) {
                    this.isDragging = true;
                    this._dragStartOffset = {
                        x: this._bounds.left,
                        y: this._bounds.top
                    };
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
    }

    /**
     * Whenever a change has occurred, this Sprite can request an
     * invalidation of the Canvas to ensure the on screen representation
     * matches the latest state.
     */
    invalidate() {
        if ( !this.canvas ) { 
            return;
        }
        this.canvas.invalidate();
    }

    /* protected methods */

    /**
     * invoked by the update()-method prior to rendering
     * this will step between the frames in the tilesheet
     *
     * @param {number=} framesSinceLastRender
     */
    protected updateAnimation( framesSinceLastRender = 1 ): void {
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
    }
}
