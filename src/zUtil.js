/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-2016 Igor Zinken / igorski
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

/* create and pool canvas for pixel retrieval upfront */

const tempCanvas  = document.createElement( "canvas" ),
      tempContext = tempCanvas.getContext( "2d" );

/**
 * @type {Object}
 */
const zUtil = module.exports = {

    /**
     * query whether the current position of given sprite1 and sprite2
     * result in a collision at the pixel level. This method increases
     * accuracy when transparency should be taken into account. While it is
     * reasonably fast, rely on zSprite.getIntersection() when rectangular, non-
     * transparent bounding boxes suffice
     *
     * @param {zSprite} sprite1
     * @param {zSprite} sprite2
     * @param {boolean=} returnCoordinate optional (defaults to false), when false
     *        boolean value is returned for the collision, when true an Object with
     *        x- and y-coordinates is returned to specify at which x- and y-coordinate
     *        a pixel collision occurred. This can be verified against sprite1's bounds
     *        to determine where the collision occurred (e.g. left, bottom, etc.)
     *
     * @return {boolean|{ x: number, y: number }}
     */
    pixelCollision( sprite1, sprite2, returnCoordinate ) {

        const rect = sprite1.getIntersection( sprite2 ); // check if sprites actually overlap

        if ( rect === null )
            return false;

        const pixels1 = zUtil.getPixelArray(
            sprite1.getBitmap(),
            rect.left - sprite1.getX(),
            rect.top  - sprite1.getY(),
            rect.width, rect.height
        );

        const pixels2 = zUtil.getPixelArray(
            sprite2.getBitmap(),
            rect.left - sprite2.getX(),
            rect.top  - sprite2.getY(),
            rect.width, rect.height
        );

        let i = 0;

        if ( returnCoordinate === true ) {

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
    },

    /**
     * Get an Array of pixels for the rectangle described at position left, top with
     * dimensions width and height within given image
     *
     * @public
     *
     * @param {HTMLImageElement|HTMLCanvasElement} image
     * @param {number} left
     * @param {number} top
     * @param {number} width
     * @param {number} height
     * @return {Array.<number>}
     */
    getPixelArray( image, left, top, width, height ) {

        // round and sanitize rectangle values

        left   = parseInt( left );
        top    = parseInt( top );
        width  = parseInt( width );
        height = parseInt( height );

        if ( width === 0 )
            width = 1;

        if ( height === 0 )
            height = 1;

        // if given Image wasn't HTMLCanvasElement, draw given Image onto temporary canvas

        const createCanvas = !( image instanceof window.HTMLCanvasElement );
        const cvs = ( createCanvas ) ? tempCanvas  : image;
        const ctx = ( createCanvas ) ? tempContext : image.getContext( "2d" );

        if ( createCanvas ) {
            cvs.width  = image.width;
            cvs.height = image.height;
            ctx.clearRect( 0, 0, tempCanvas.width, tempCanvas.height );
            ctx.drawImage( image, 0, 0) ;
        }

        // collect all pixels

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
    }
};
