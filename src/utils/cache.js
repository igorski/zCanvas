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
import { resizeImage } from "./draw-util";

/**
 * @typedef {{
 *    original: Image,
 *    bitmap: Image,
 *    size: Size
 * }} CachedBitmapEntry
 */

export default class Cache {
    /**
     * @private
     * @type {Map<string, CachedBitmapEntry>}
     */
    #map;

    constructor() {
        this.#map = new Map();
    }

    dispose() {
        this.#map.clear();
        this.#map = undefined;
    }

    /**
     * @param {string} key 
     * @returns {Image|undefined}
     */
    get( key ) {
        return this.#map.get( key )?.bitmap;
    }

    set( key, image, resizedImage, size ) {
        this.#map.set( key, {
            original: image,
            resizedImage,
            size,
        });
        return resizedImage;
    }

    /**
     * Caches given image at provided width and height. This can be used
     * to speed up repeating rendering by using an appropriately sized source.
     * Must be invalidated whenever size of drawable element changes.
     * 
     * @param {string} key 
     * @param {HTMLImageElement|HTMLCanvasElement|string} image
     * @param {number=} width, defaults to image width
     * @param {number=} height, defaults to image height
     * @returns {Promise<Image>}
     */
    async cache( key, image, width = 0, height = 0 ) {
        const isCanvasElement = image instanceof window.HTMLCanvasElement;
        const isImageElement  = image instanceof window.HTMLImageElement;
  
        let size;
        
        if ( isCanvasElement ) {
            size.width  = image.width;
            size.height = image.height;
        } else {
            ({ size, image } = await Loader.loadImage(
                isImageElement ? image.src : image, isImageElement ? image : null
            ));
        }

        let resizedImage = image;
        if (( width > 0 && size.width !== width ) || ( height > 0 && size.height !== height )) {
            resizedImage = await resizeImage({ size, image }, width, height );
        }
        this.set( key, image, resizedImage, size );

        return resizedImage;
    }

    has( key, width, height ) {
        const entry = this.#map.get( key );
        if ( !entry ) {
            return false;
        }
        console.info("has entry for " + key +":"+(entry.size.width === width && entry.size.height === height));
        return entry.size.width === width && entry.size.height === height;
    }

    /**
     * @param {string} key
     * @return {boolean}
     */
    clear( key ) {
        return this.#map.delete( key );
    }
}
