/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2013-2020 - https://www.igorski.nl
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

/* create and pool canvas for pixel retrieval upfront */

const tempCanvas  = document.createElement( "canvas" ),
      tempContext = tempCanvas.getContext( "2d" );

/**
 * query whether the current position of given sprite1 and sprite2
 * result in a collision at the pixel level. This method increases
 * accuracy when transparency should be taken into account. While it is
 * reasonably fast, rely on sprite.getIntersection() when rectangular, non-
 * transparent bounding boxes suffice
 *
 * @param {sprite} sprite1
 * @param {sprite} sprite2
 * @param {boolean=} optReturnAsCoordinate optional (defaults to false), when false
 *        boolean value is returned for the collision, when true an Object with
 *        x- and y-coordinates is returned to specify at which x- and y-coordinate
 *        a pixel collision occurred. This can be verified against sprite1's bounds
 *        to determine where the collision occurred (e.g. left, bottom, etc.) If no
 *        collision occurred, boolean false is returned
 *
 * @return {boolean|{ x: number, y: number }}
 */
export const pixelCollision = ( sprite1, sprite2, optReturnAsCoordinate ) => {

    const rect = sprite1.getIntersection( sprite2 ); // check if sprites actually overlap

    if ( rect === null )
        return false;

    const pixels1 = getPixelArray( sprite1, rect );
    const pixels2 = getPixelArray( sprite2, rect );

    let i = 0;

    if ( optReturnAsCoordinate === true ) {

        // x, y-coordinate requested ? use alternate loop

        for ( let y = 0; y < rect.height; ++y ) {
            for ( let x = 0; x < rect.width; ++x ) {

                if ( pixels1[ i ] !== 0 && pixels2[ i ] !== 0 )
                    return { x : x, y: y };
                ++i;
            }
        }
    }
    else {

        // slight performance gain of single loop

        for ( i; i < pixels1.length; ++i ) {

            if ( pixels1[ i ] !== 0 && pixels2[ i ] !== 0 )
                return true;
        }
    }
    return false;
};

/**
 * Get an Array of pixels for the area described by given rect
 * inside the Bitmap of given sprite
 *
 * @param {sprite} sprite
 * @param {{ left: number, top: number, width: number, height: number }} rect
 * @return {Array<number>}
 */
export const getPixelArray = ( sprite, rect ) => {

    const image  = sprite.getBitmap(),
          bounds = sprite.getBounds();

    // round and sanitize rectangle values

    const left = parseInt( rect.left - bounds.left );
    const top  = parseInt( rect.top  - bounds.top );
    let width  = parseInt( rect.width );
    let height = parseInt( rect.height );

    if ( width === 0 )
        width = 1;

    if ( height === 0 )
        height = 1;

    // if given Sprites Bitmap wasn't of HTMLCanvasElement-type,
    // draw the Sprites Image onto temporary canvas

    const createCanvas = !( image instanceof window.HTMLCanvasElement );
    const cvs = ( createCanvas ) ? tempCanvas  : image;
    const ctx = ( createCanvas ) ? tempContext : image.getContext( "2d" );

    if ( createCanvas ) {
        cvs.width  = bounds.width;
        cvs.height = bounds.height;
        ctx.clearRect( 0, 0, tempCanvas.width, tempCanvas.height );
        ctx.drawImage( image, 0, 0, bounds.width, bounds.height );
    }

    // collect all pixels for described area

    const imageData = ctx.getImageData( left, top, width, height );
    const rgb       = imageData.data;
    const pixels    = new Array( parseInt( width * height ));
    let i = 0;

    for ( let y = 0; y < height; ++y ) {

        for ( let x = 0; x < width; ++x ) {

            let p = ( y * width + x ) * 4;
            pixels[ i ] = ( rgb[ p + 3 ] << 24 ) | ( rgb[ p ] << 16 ) | ( rgb[ p + 1 ] << 8 ) | rgb[ p + 2 ];
            ++i;
        }
    }
    return pixels;
};

/**
 * retrieve all children in given Sprite list that are currently residing at
 * a given coordinate and rectangle, can be used in conjunction with sprite
 * "collidesWith"-method to query only the objects that are in its vicinity, greatly
 * freeing up CPU resources by not checking against out of bounds objects
 *
 * @param {Array<sprite>} aSpriteList
 * @param {number} aX x-coordinate
 * @param {number} aY y-coordinate
 * @param {number} aWidth rectangle width
 * @param {number} aHeight rectangle height
 * @param {boolean=} aOnlyCollidables optionally only return children that are collidable defaults to false
 *
 * @return {Array<sprite>}
 */
export const getChildrenUnderPoint = ( aSpriteList, aX, aY, aWidth, aHeight, aOnlyCollidables ) => {

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
            if ( !aOnlyCollidables || ( aOnlyCollidables && theChild.collidable ))
                out.push( theChild );
        }
    }
    return out;
};
