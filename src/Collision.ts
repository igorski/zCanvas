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
import { fastRound } from "./utils/ImageMath";
import { createCanvas, imageToCanvas } from "./utils/ImageUtil";
import type Sprite from "./Sprite";

// keep strong references to mask values to minimise garbage collection hit
const pixels1: number[] = [];
const pixels2: number[] = [];

const TRANSPARENT     = 0;
const NON_TRANSPARENT = 1;

const tempCanvas = createCanvas( 1, 1, true ).cvs;

export default class Collision {
    private _cacheMap: Map<string, { mask: Uint8Array, size: Size }> = new Map();

    constructor( private _renderer: RenderAPI ) {};

    dispose(): void {
        this._cacheMap.clear();
        this._cacheMap = undefined;
    }
    
    /**
     * Retrieves all children in given Sprite list that are currently residing at
     * given rectangle. Can be used in conjunction with the "collidesWith"-method of
     * the Sprite class to query only the objects that are in its vicinity, greatly
     * freeing up CPU resources by not checking against out of bounds objects.
     *
     * @param {Sprite[]} sprites
     * @param {number} x x-coordinate
     * @param {number} y y-coordinate
     * @param {number} width rectangle width
     * @param {number} height rectangle height
     * @param {boolean=} collidablesOnly optionally only return children that are collidable. defaults to false
     * @return {Sprite[]}
     */
    getChildrenInArea( sprites: Sprite[], x: number, y: number, width: number, height: number, collidablesOnly = false ): Sprite[] {
        const out: Sprite[] = [];

        let i = sprites.length;
        let child: Sprite;
        let childX, childY, childWidth, childHeight;
    
        while ( i-- ) {
    
            child = sprites[ i ];
    
            childX      = child.getX();
            childY      = child.getY();
            childWidth  = child.getWidth();
            childHeight = child.getHeight();
    
            if ( childX < x + width  && childX + childWidth  > x &&
                 childY < y + height && childY + childHeight > y )
            {
                if ( !collidablesOnly || ( collidablesOnly && child.collidable )) {
                    out.push( child );
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
     * @returns {Point|undefined} when a collision occurred, x- and y-coordinates are returned to specify at
     *     which x- and y-coordinate the collision occurred. This can be verified against sprite1's bounds
     *     to determine where the collision occurred (e.g. left, bottom, etc.).
     *     When no collision occurred, undefined is returned
     */
    pixelCollision( sprite1: Sprite, sprite2: Sprite ): Point | undefined {

        const rect = sprite1.getIntersection( sprite2 ); // check if sprites actually overlap
    
        if ( rect === undefined ) {
            return undefined;
        }
    
        this.getPixelArray( sprite1, rect, pixels1 );
        this.getPixelArray( sprite2, rect, pixels2 );

        const xx = rect.width;
        const yy = rect.height;
        let i = 0;

        // TODO we can speed this up by converting the max to 32-bit numbers we can use to
        // check 32 pixels at once, see https://gist.github.com/tfry-git/3f5faa0b1c252dd1e6849da18c16570f
        
        for ( let y = 0; y < yy; ++y ) {
            for ( let x = 0; x < xx; ++x ) {
                if ( pixels1[ i ] === NON_TRANSPARENT && pixels2[ i ] === NON_TRANSPARENT ) {
                    return { x, y };
                }
                ++i;
            }
        }
        return undefined;
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

        const { data } = tempCanvas.getContext( "2d" ).getImageData( 0, 0, width, height );

        // create a Map of non-transparent pixels, converting the RGBA map to a list of boolean values
        // indicating whether a pixel is transparent or not

        const mask = new Uint8Array( data.length / 4 );
        for ( let i = 0, l = mask.length; i < l; ++i ) {
            const index = i * 4;
            // collect RGBA value
            // const value = ( data[ i + 3 ] << 24 ) | ( data[ i ] << 16 ) | ( data[ i + 1 ] << 8 ) | data[ i + 2 ];
            // Nah, just take the alpha value (0 - 255) instead of creating a 24-bit number
            const value = data[ index + 3 ];

            mask[ i ] = ( value < 5 ) ? TRANSPARENT : NON_TRANSPARENT;
        }

        this._cacheMap.set(
            resourceId, { 
                mask: mask,
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
    protected getPixelArray( sprite: Sprite, rect: Rectangle, pixels: number[] ): void {
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

        const { mask: data, size } = this._cacheMap.get( resourceId );

        if ( width <= 0 || height <= 0 ) {
            pixels.length = 0;
            return;
        }

        // retrieve pixelData array for given Sprites Bitmap

        pixels.length = fastRound( width * height );
    
        const mapHeight = size.height;
        const mapWidth  = size.width;

        // collect all pixels for the described area

        const right  = left + width;
        const bottom = top  + height;

        let i = -1;
        let value = TRANSPARENT;

        for ( let y = top; y < bottom; ++y ) {
            for ( let x = left; x < right; ++x ) {
                if ( x >= mapWidth || y >= mapHeight ) {
                    value = TRANSPARENT;
                } else {
                    value = data[ y * mapWidth + x ];
                }
                pixels[ ++i ] = value;
            }
        }
        return;
    }
}
