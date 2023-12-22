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
import type { Point, Rectangle, Size } from "./definitions/types";
import type RenderAPI from "./rendering/RenderAPI";
import { createCanvas, imageToCanvas } from "./utils/ImageUtil";
import type Sprite from "./Sprite";

const fastRound = ( num: number ): number => num > 0 ? ( num + .5 ) << 0 : num | 0;

// keep strong references to avoid garbage collection hit
const pixels1: number[] = [];
const pixels2: number[] = [];

const tempCanvas = createCanvas( 1, 1, true ).cvs;

export default class Collision {
    private _cacheMap: Map<string, { data: Uint8ClampedArray, size: Size }> = new Map();

    constructor( private _renderer: RenderAPI ) {};

    dispose(): void {
        this._cacheMap.clear();
        this._cacheMap = undefined;
    }
    
    /**
     * retrieve all children in given Sprite list that are currently residing at
     * a given coordinate and rectangle, can be used in conjunction with sprite
     * "collidesWith"-method to query only the objects that are in its vicinity, greatly
     * freeing up CPU resources by not checking against out of bounds objects
     *
     * @param {Sprite[]} sprites
     * @param {number} aX x-coordinate
     * @param {number} aY y-coordinate
     * @param {number} aWidth rectangle width
     * @param {number} aHeight rectangle height
     * @param {boolean=} aOnlyCollidables optionally only return children that are collidable. defaults to false
     * @return {Sprite[]}
     */
    getChildrenUnderPoint( sprites: Sprite[], aX: number, aY: number, aWidth: number, aHeight: number, aOnlyCollidables = false ): Sprite[] {
        const out = [];
        let i = sprites.length, theChild, childX, childY, childWidth, childHeight;
    
        while ( i-- ) {
    
            theChild = sprites[ i ];
    
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
    }

    /**
     * query whether the current position of given sprite1 and sprite2
     * result in a collision at the pixel level. This method increases
     * accuracy when transparency should be taken into account. While it is
     * reasonably fast, rely on sprite.getIntersection() when rectangular, non-
     * transparent bounding boxes suffice
     *
     * @param {Sprite} sprite1
     * @param {Sprite} sprite2
     * @param {boolean=} optReturnAsCoordinate optional (defaults to false), when false
     *        boolean value is returned for the collision, when true an Object with
     *        x- and y-coordinates is returned to specify at which x- and y-coordinate
     *        a pixel collision occurred. This can be verified against sprite1's bounds
     *        to determine where the collision occurred (e.g. left, bottom, etc.) If no
     *        collision occurred, boolean false is returned
     *
     * @return {boolean|Point}
     */
    pixelCollision( sprite1: Sprite, sprite2: Sprite, optReturnAsCoordinate = false ): Point | boolean {

        const rect = sprite1.getIntersection( sprite2 ); // check if sprites actually overlap
    
        if ( rect === undefined ) {
            return false;
        }
    
        this.getPixelArray( sprite1, rect, pixels1 );
        this.getPixelArray( sprite2, rect, pixels2 );
    
        let i = 0;
    
        if ( optReturnAsCoordinate === true ) {
    
            // x, y-coordinate requested ? use alternate loop
    
            const xx = rect.width;
            const yy = rect.height;
    
            for ( let y = 0; y < yy; ++y ) {
                for ( let x = 0; x < xx; ++x ) {
                    if ( pixels1[ i ] !== 0 && pixels2[ i ] !== 0 ) {
                        return { x, y };
                    }
                    ++i;
                }
            }
        } else {
            // slight performance gain provided by single loop
            const l = pixels1.length;
            for ( i; i < l; ++i ) {
                if ( pixels1[ i ] !== 0 && pixels2[ i ] !== 0 ) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * Add given Bitmap into the collision cache for faster collision handling
     * at the expense of using more memory
     */
    async cache( resourceId: string ): Promise<boolean> {
        const bitmap = await this._renderer.getResource( resourceId );
        if ( !bitmap ) {
            return false;
        }
        const { width, height } = bitmap;

        imageToCanvas( tempCanvas, bitmap, width, height );
      
        this._cacheMap.set(
            resourceId, { 
                data: tempCanvas.getContext( "2d" ).getImageData( 0, 0, width, height ).data,
                size: { width, height }
            }
        );
        tempCanvas.width = tempCanvas.height = 1; // free allocated memory

        return true;
    }
    
    /**
     * Removes given Bitmap from the collision cache
     */
    clearCache( resourceId: string ): boolean {
        if ( this.hasCache( resourceId )) {
            this._cacheMap.delete( resourceId );
            return true;
        }
        return false;
    };
    
    /**
     * Whether given Bitmap is present inside the collision cache
     */
    hasCache( resourceId: string ): boolean {
        return this._cacheMap.has( resourceId );    
    }

    /**
     * Get an Array of pixels for the area described by given rect
     * inside the Bitmap of given sprite
     *
     * @param {Sprite} sprite
     * @param {Rectangle} rect
     * @param {number[]} pixels Array to write pixels into
     */
    getPixelArray( sprite: Sprite, rect: Rectangle, pixels: number[] ): void {
        const resourceId = sprite.getResourceId();

        if ( !this.hasCache( resourceId ) ) {
            throw new Error( `Cannot get cached entry for resource "${resourceId}". Cache it first.` );
        }
        const bounds = sprite.getBounds();

        // round and sanitize rectangle values

        const left   = fastRound( rect.left - bounds.left );
        const top    = fastRound( rect.top  - bounds.top );
        const width  = fastRound( rect.width );
        const height = fastRound( rect.height );

        const { data, size } = this._cacheMap.get( resourceId );

        if ( width === 0 || height === 0 ) {
            pixels.length = 0;
            return;
        }

        // retrieve pixelData array for given Sprites Bitmap

        pixels.length = fastRound( width * height );

        const mapWidth = size.width;

        // collect all pixels for the described area

        const yy = top  + height;
        const xx = left + width;

        let i = -1;

        for ( let y = top; y < yy; ++y ) {
            for ( let x = left; x < xx; ++x ) {
                const p = ( y * mapWidth + x ) * 4;
                //pixels[ ++i ] = ( data[ p + 3 ] << 24 ) | ( data[ p ] << 16 ) | ( data[ p + 1 ] << 8 ) | data[ p + 2 ];
                // just take the alpha value (0 - 255) instead of creating a 24-bit number
                pixels[ ++i ] = data[ p + 3 ];
            }
        }
    }
}
