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
import EventHandler from "./utils/event-handler";

/**
 * loader provides an interface that allows the loading of Images
 * regardless of their source type (e.g. path to (cross origin) image, Blob URL)
 * and always ensures Image content is actually ready for rendering
 */
const Loader = {

    /**
     * Load the image contents described in aSource and fire a callback when the
     * resulting Bitmap has been loaded and is ready for rendering, the callback
     * method will receive the following result as its first argument:
     *
     * {{
     *     image: HTMLImageElement,
     *     size: {{
     *               width: number,
     *               height: number
     *           }}
     * }}
     *
     * if an Error has occurred the second argument will be the Error
     *
     * @param {string}    aSource either base64 encoded bitmap data or (web)path
     *                    to an image file
     * @param {Image=}    aOptImage optional HTMLImageElement to load the aSource
     *                    into, in case we'd like to re-use an existing Element
     *                    (will not work in Firefox repeatedly as load handlers
     *                    will only fire once)
     * @return {Promise} will receive loaded Image
     */
    loadImage( aSource, aOptImage = null ) {
        return new Promise(( resolve, reject ) => {

            // if we were supplied with a ready Image, don't load anything
            if ( aOptImage instanceof window.Image && Loader.isReady( aOptImage )) {
                resolve( wrapOutput( aOptImage ));
                return;
            }
            const out       = aOptImage || new window.Image();
            const isDataURL = isDataSource( aSource );

            const handler = new EventHandler();

            const errorHandler = ( aError ) => {
                handler.dispose();
                reject( aError );
            };
            const loadHandler = async () => {
                handler.dispose();
                try {
                    await Loader.onReady( out );
                    resolve( wrapOutput( out ));
                } catch ( e ) {
                    reject( e );
                }
            };

            // in JSDOM the load event won't fire for base64 strings (or images in general)
            // for every other (browser) environment, add load listeners

            const addLoadListeners = !isDataURL || /^((?!jsdom).)*$/.test( window.navigator.userAgent );

            if ( addLoadListeners ) {

                // supplying the crossOrigin for a LOCAL image (e.g. retrieved via FileReader)
                // is an illegal statement in Firefox and Safari and will break execution
                // of the remainder of this function body! we only supply it for
                // src attributes that AREN'T local data strings

                if ( !isDataURL ) {
                    applyOrigin( aSource, out );
                }
                handler.add( out, "load",  loadHandler );
                handler.add( out, "error", errorHandler );
            }

            // load the image
            out.src = aSource;

            // as stated above, invoke callback immediately for data strings when no load is required
            if ( !addLoadListeners ) {
                resolve( wrapOutput( out ));
            }
        });
    },

    /**
     * a quick query to check whether the Image is ready for rendering
     *
     * @public
     * @param {Image} aImage
     * @return {boolean}
     */
    isReady( aImage ) {
        // first check : load status
        if ( typeof aImage.complete === "boolean" && !aImage.complete ) {
            return false;
        }
        // second check : validity of source (can be 0 until bitmap has been fully parsed by browser)
        return !( typeof aImage.naturalWidth !== "undefined" && aImage.naturalWidth === 0 );
    },

    /**
     * Executes given callback when given Image is actually ready for rendering
     * If the image was ready when this function was called, execution is synchronous
     * if not it will be made asynchronous via RAF delegation
     *
     * @public
     * @param {Image} aImage
     * @return {Promise}
     */
    async onReady( aImage, aCallback, aErrorCallback ) {
        return new Promise(( resolve, reject ) => {
            // if this didn't resolve in a full second, we presume the Image is corrupt

            const MAX_ITERATIONS = 60;
            let iterations = 0;

            function readyCheck() {
                if ( Loader.isReady( aImage )) {
                    resolve();
                } else if ( ++iterations === MAX_ITERATIONS ) {
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
 *
 * @param {string} aImageURL
 * @param {Image} aImage
 */
function applyOrigin( aImageURL, aImage ) {
    if ( !isLocalURL( aImageURL )) {
        aImage.crossOrigin = "Anonymous";
    }
}

/**
 * checks whether the contents of an Image are either a base64 encoded string
 * or a Blob
 *
 * @param {Image|string} image when string, it is the src attribute of an Image
 * @return {boolean}
 */
function isDataSource( image ) {

    const source = (typeof image === "string" ? image : image.src).substr(0, 5);

    // base 64 string contains data-attribute, the MIME type and then the content, e.g. :
    // e.g. "data:image/png;base64," for a typical PNG, Blob string contains no MIME, e.g.:
    // blob:http://localhost:9001/46cc7e56-cf2a-7540-b515-1d99dfcb2ad6
    return source === "data:" || source === "blob:";
}

/**
 * @param {Image} image
 * @return {{ width: number, height: number }}
 */
function getSize( image ) {
    return {
        width: image.width   || image.naturalWidth,
        height: image.height || image.naturalHeight
    };
}

/**
 * checks whether given aURL is a URL to a remote resource (e.g. not on the
 * same server/origin as this application) or whether it is local (e.g. a URL
 * to a file on the same server or a data URL)
 *
 * @param {string=} aURL
 * @return {boolean}
 */
function isLocalURL( aURL ) {

    // check if the URL belongs to an asset on the same domain the application is running on

    const { location } = window;
    if ( aURL.substr( 0, 2 ) === "./" ||
        aURL.indexOf( `${location.protocol}//${location.host}` ) === 0 ) {
        return true;
    }

    // check if given URL is a http(s) URL, if so we know it is not local

    let urlRoot = ( aURL.split( "#" )[ 0 ] ).split( "?" )[ 0 ];

    // .html-file in the path name ? strip it

    if ( urlRoot.includes( ".html" )) {

        const urlArr    = urlRoot.split( "/" );
        const arrLength = urlArr.length;
        urlRoot = urlRoot.split( urlArr[ arrLength - 1 ]).join( "" );
    }

    if ( urlRoot ) {
        const match = urlRoot.match( /^http[s]?:/ );
        if ( Array.isArray( match ) && match.length > 0 ) {
            return false;
        }
    }

    // at this point we know we're likely dealing with a data URL, which is local

    return true;
}

function wrapOutput( image ) {
    const out = {
        image: image,
        size: null
    };
    if ( image instanceof window.HTMLImageElement ) {
        out.size = getSize( image );
    }
    return out;
}
