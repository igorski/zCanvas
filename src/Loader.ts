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
import type { SizedImage, Size } from "./definitions/types";
import EventHandler from "./utils/EventHandler";
import { imageToBitmap, blobToImage } from "./utils/ImageUtil";
import { readFile } from "./utils/FileUtil";

/**
 * loader provides an interface that allows the loading of Images
 * regardless of their source type (e.g. path to (cross origin) image, Blob URL)
 * and always ensures Image content is actually ready for rendering
 */
const Loader = {

    /**
     * Load the image contents described in aSource and fire a callback when the
     * resulting Bitmap has been loaded and is ready for rendering, the callback
     * method will receive a SizedImage object as its first argument.
     *
     * if an Error has occurred the second argument will be the Error
     *
     * @param {string | Blob | File} source when string, can be base64 or URL to file / blob URL
     * @return {Promise<SizedImage>}
     */
    loadImage( source: string | Blob | File ): Promise<SizedImage> {
        return new Promise( async ( resolve, reject ) => {
            // first check whether source is binary data
            let blob: Blob;
            if ( source instanceof File ) {
                blob = await readFile( source as File );
            } else if ( source instanceof Blob ) {
                blob = source as Blob;
            }

            if ( blob !== undefined ) {
                try {
                    const image = await blobToImage( blob );
                    Loader.onReady( image ).then(() => resolve( wrapOutput( image )));
                } catch ( e: any ) {
                    reject( e );
                }
                return;
            }
            // source is String
            const isDataURL = isDataSource( source as string );
            const out = new window.Image();
            const handler = new EventHandler();

            const errorHandler = (): void => {
                handler.dispose();
                reject();
            };
            const loadHandler = (): void => {
                handler.dispose();
                Loader.onReady( out ).then(() => resolve( wrapOutput( out ))).catch( reject );
            };

            if ( !isDataURL ) {

                // supplying the crossOrigin for a LOCAL image (e.g. retrieved via FileReader)
                // is an illegal statement in Firefox and Safari and will break execution
                // of the remainder of this function body! we only supply it for
                // src attributes that AREN'T local data strings

                applyOrigin( source as string, out );

                handler.add( out, "load",  loadHandler );
                handler.add( out, "error", errorHandler );
            }

            // load the image
            out.src = source as string;

            // invoke callback immediately for data strings when no load is required

            if ( isDataURL ) {
                loadHandler();
            }
        });
    },

    async loadBitmap( source: string ): Promise<ImageBitmap> {
        const { image } = await Loader.loadImage( source );
        return imageToBitmap( image );
    },

    /**
     * a quick query to check whether given Image is ready for rendering on Canvas
     */
    isReady( image: HTMLImageElement ): boolean {
        // first check : load status
        if ( image.complete !== true ) {
            return false;
        }
        // second check : validity of source (can be 0 until bitmap has been fully parsed by browser)
        return typeof image.naturalWidth === "number" && image.naturalWidth > 0;
    },

    /**
     * Executes given callback when given Image is actually ready for rendering
     * If the image was ready when this function was called, execution is synchronous
     * if not it will be made asynchronous via RAF delegation
     */
    onReady( image: HTMLImageElement ): Promise<void> {
        return new Promise(( resolve, reject ) => {
            // if this didn't resolve in a full second, we presume the Image is corrupt

            const MAX_ITERATIONS = 60;
            let iterations = 0;

            function readyCheck() {
                if ( Loader.isReady( image )) {
                    resolve();
                } else if ( ++iterations === MAX_ITERATIONS ) {
                    console.error( typeof image );
                    reject( new Error( "Image could not be resolved. This shouldn't occur." ));
                } else {
                    // requestAnimationFrame preferred over a timeout as
                    // browsers will fire this when the DOM is actually ready (e.g. Image is rendered)
                    window.requestAnimationFrame( readyCheck );
                }
            }
            readyCheck();
        });
    }
};
export default Loader;

/* internal methods */

/**
 * Firefox and Safari will NOT accept images with erroneous crossOrigin attributes !
 * this method applies the correct value accordingly
 */
function applyOrigin( imageURL: string, image: HTMLImageElement ): void {
    if ( !isLocalURL( imageURL )) {
        image.crossOrigin = "Anonymous";
    }
}

/**
 * checks whether the contents of an Image are either a base64 encoded string or a Blob
 */
function isDataSource( src: string ): boolean {

    const source = src.substring( 0, 5 );

    // base64 string contains data-attribute, the MIME type and then the content, e.g. :
    // e.g. "data:image/png;base64," for a typical PNG, Blob string contains no MIME, e.g.:
    // blob:http://localhost:9001/46cc7e56-cf2a-7540-b515-1d99dfcb2ad6

    return source === "data:" || source === "blob:";
}

function getSize( image: HTMLImageElement ): Size {
    return {
        width  : image.width  || image.naturalWidth,
        height : image.height || image.naturalHeight
    };
}

/**
 * checks whether given aURL is a URL to a remote resource (e.g. not on the
 * same server/origin as this application) or whether it is local (e.g. a URL
 * to a file on the same server or a data URL)
 */
function isLocalURL( url: string ): boolean {

    // check if the URL belongs to an asset on the same domain the application is running on

    const { location } = window;
    if ( url.startsWith( "./" ) || url.startsWith( `${location.protocol}//${location.host}` )) {
        return true;
    }

    // check if given URL is a http(s) URL, if so we know it is not local

    if ( /^http[s]?:/.test( url )) {
        return false;
    }

    // at this point we know we're likely dealing with a data URL, which is local

    return true;
}

function wrapOutput( image: HTMLImageElement ): SizedImage {
    const out = {
        image: image,
        size: { width: 0, height: 0 }
    };
    if ( image instanceof window.HTMLImageElement ) {
        out.size = getSize( image );
    }
    return out;
}
