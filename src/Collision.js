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
import Loader from "./Loader.js";

/* lazily create a pooled canvas for pixel retrieval operations */

let _tempCanvas = undefined;
const getTempCanvas = () => {
    if ( !_tempCanvas ) {
        _tempCanvas = document.createElement( "canvas" );
    }
    return _tempCanvas;
}

const cacheMap = new Map();

// keep strong references to avoid garbage collection hit
const pixels1 = [];
const pixels2 = [];

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
export const pixelCollision = ( sprite1, sprite2, optReturnAsCoordinate = false ) => {

    const rect = sprite1.getIntersection( sprite2 ); // check if sprites actually overlap

    if ( rect === null ) {
        return false;
    }

    getPixelArray( sprite1, rect, pixels1 );
    getPixelArray( sprite2, rect, pixels2 );

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
    }
    else {

        // slight performance gain provided by single loop
        const l = pixels1.length;
        for ( i; i < l; ++i ) {
            if ( pixels1[ i ] !== 0 && pixels2[ i ] !== 0 ) {
                return true;
            }
        }
    }
    return false;
};

/**
 * Get an Array of pixels for the area described by given rect
 * inside the Bitmap of given sprite
 *
 * @param {Sprite} sprite
 * @param {Rectangle} rect
 * @param {Array<number>} pixels Array to write pixels into
 */
export const getPixelArray = ( sprite, rect, pixels ) => {

    const image  = sprite.getBitmap(),
          bounds = sprite.getBounds();

    // round and sanitize rectangle values

    const left = parseInt( rect.left - bounds.left );
    const top  = parseInt( rect.top  - bounds.top );
    let width  = parseInt( rect.width );
    let height = parseInt( rect.height );

    if ( width === 0 || height === 0 ) {
        return pixels.length = 0;
    }

    // retrieve pixelData array for given Sprites Bitmap

    pixels.length = parseInt( width * height );
    let rgba, mapWidth, l, t;

    // if Bitmap is cached, take pixelData array from cache

    const cachedBitmap = cacheMap.get( image );

    // note when we hit the very right edge, we take a "live" imageData
    // snapshot (as otherwise collisions are seen due to - assumed - subpixel
    // which seems to not occur when getImageData() works on a smaller area)

    if ( cachedBitmap && ( left + width ) < image.width ) {
        rgba = cachedBitmap;
        mapWidth = image.width;

        t = top;
        l = left;
    }
    else {

        // if given Sprites Bitmap wasn't of HTMLCanvasElement-type,
        // draw the Sprites Image onto a temporary canvas first

        const createCanvas = !( image instanceof window.HTMLCanvasElement );
        const ctx = ( createCanvas ? getTempCanvas() : image ).getContext( "2d" );

        if ( createCanvas ) {
            imageToCanvas( getTempCanvas(), image, bounds.width, bounds.height );
        }

        rgba = ctx.getImageData( left, top, width, height ).data;
        mapWidth = width;

        t = 0;
        l = 0;
    }

    // collect all pixels for the described area

    const yy = t + height;
    const xx = l + width;

    let i = -1;
    for ( let y = t; y < yy; ++y ) {
        for ( let x = l; x < xx; ++x ) {
            const p = ( y * mapWidth + x ) * 4;
            pixels[ ++i ] = ( rgba[ p + 3 ] << 24 ) | ( rgba[ p ] << 16 ) | ( rgba[ p + 1 ] << 8 ) | rgba[ p + 2 ];
        }
    }
};

/**
 * retrieve all children in given Sprite list that are currently residing at
 * a given coordinate and rectangle, can be used in conjunction with sprite
 * "collidesWith"-method to query only the objects that are in its vicinity, greatly
 * freeing up CPU resources by not checking against out of bounds objects
 *
 * @param {Array<Sprite>} aSpriteList
 * @param {number} aX x-coordinate
 * @param {number} aY y-coordinate
 * @param {number} aWidth rectangle width
 * @param {number} aHeight rectangle height
 * @param {boolean=} aOnlyCollidables optionally only return children that are collidable. defaults to false
 *
 * @return {Array<Sprite>}
 */
export const getChildrenUnderPoint = ( aSpriteList, aX, aY, aWidth, aHeight, aOnlyCollidables = false ) => {

    const out = [];
    let i = aSpriteList.length, theChild, childX, childY, childWidth, childHeight;

    while ( i-- ) {

        theChild = aSpriteList[ i ];

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
 * Add given Bitmap into the collision cache for faster collision handling
 * at the expense of using more memory
 *
 * @param {HTMLCanvasElement|HTMLImageElement} bitmap
 * @return {Promise<boolean>}
 */
export const cache = bitmap => {
    return new Promise(( resolve, reject ) => {
        const createCanvas = !( bitmap instanceof window.HTMLCanvasElement );
        if ( createCanvas ) {
            Loader.onReady( bitmap ).then(() => {
                const { width, height } = bitmap;
                const tempCanvas = getTempCanvas();
                cacheMap.set(
                    bitmap,
                    imageToCanvas( tempCanvas, bitmap, width, height ).getImageData( 0, 0, width, height ).data
                );
                tempCanvas.width = tempCanvas.height = 1; // minimize memory consumption

                resolve( true );
            }).catch( reject );
        } else {
            cacheMap.set( bitmap, bitmap.getContext( "2d" ).getImageData( 0, 0, bitmap.width, bitmap.height ).data );
            resolve( true );
        }
    });
};

/**
 * Removes given Bitmap from the collision cache
 *
 * @param {HTMLCanvasElement|HTMLImageElement} bitmap
 * @return {boolean}
 */
export const clearCache = bitmap => {
    if ( hasCache( bitmap )) {
        cacheMap.delete( bitmap );
        return true;
    }
    return false;
};

/**
 * Whether given Bitmap is present inside the collision cache
 *
 * @param {HTMLCanvasElement|HTMLImageElement} bitmap
 * @return {boolean}
 */
export const hasCache = bitmap => cacheMap.has( bitmap );

/* internal methods */

function imageToCanvas( cvs, image, width, height ) {
    const ctx = cvs.getContext( "2d" );

    cvs.width  = width;
    cvs.height = height;
    ctx.clearRect( 0, 0, width, height );
    ctx.drawImage( image, 0, 0, width, height );

    return ctx;
}
