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
import Loader from "../Loader";

/* lazily create a pooled canvas for pixel retrieval operations */

let _tempCanvas = undefined;

/**
 * Returns a lazily created and pooled reference to a temporary canvas
 * which can be used for synchronous drawing operations
 * @returns {HTMLCanvasElement}
 */
export function getTempCanvas() {
    if ( !_tempCanvas ) {
        _tempCanvas = document.createElement( "canvas" );
    }
    return _tempCanvas;
}

/**
 * Minimise the memory allocated to the temporary canvas.
 * Call after drawing operations completed.
 */
export function clearTempCanvas() {
    _tempCanvas.width  = 1;
    _tempCanvas.height = 1;
}

/**
 * @param {SizedImage} image 
 * @param {number} width 
 * @param {height} height
 * @param {boolean=} transparent
 * @returns {Promise<HTMLImageElement>}
 */
export async function resizeImage( sizedImage, width, height, transparent = true ) {
    if ( sizedImage.size.width === width || sizedImage.size.height === height ) {
        console.info("return as is");
        return sizedImage.image;
    }
    imageToCanvas( getTempCanvas(), sizedImage.image, width, height );
    const imageSource = getTempCanvas().toDataURL( transparent ? "image/png" : "image/jpg" );

    clearTempCanvas();

    const output = new Image();

    await Loader.loadImage( imageSource, output );
    
    return output;
}

/**
 * @param {HTMLCanvasElement} cvs 
 * @param {HTMLImageElement} image 
 * @param {number} width 
 * @param {height} height 
 * @returns {CanvasRenderingContext2D}
 */
export function imageToCanvas( cvs, image, width, height ) {
    const ctx = cvs.getContext( "2d" );

    cvs.width  = width;
    cvs.height = height;
    ctx.clearRect( 0, 0, width, height );
    ctx.drawImage( image, 0, 0, width, height );

    return ctx;
}
