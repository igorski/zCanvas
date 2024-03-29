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
// @ts-expect-error "WorkerGlobalScope" is not universallly defined
const isWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;

/* lazily create a pooled canvas for pixel retrieval operations */

let _tempCanvas: HTMLCanvasElement;

/**
 * Creates a new HTMLCanvasElement, returning both
 * the element and its CanvasRenderingContext2D
 */
export function createCanvas( width = 0, height = 0, optimizedReads = false ): { cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D } {
    let cvs: HTMLCanvasElement;
    if ( isWorker ) {
        cvs = new OffscreenCanvas( width, height ) as unknown as HTMLCanvasElement;
    } else {
        cvs = self.document.createElement( "canvas" );
    }
    const ctx = cvs.getContext( "2d", optimizedReads ? { willReadFrequently: true } : undefined ) as CanvasRenderingContext2D;

    if ( width !== 0 && height !== 0 ) {
        cvs.width  = width;
        cvs.height = height;
    }
    return { cvs, ctx };
}

/**
 * Returns a lazily created and pooled reference to a temporary canvas
 * which can be used for synchronous drawing operations
 */
export function getTempCanvas(): HTMLCanvasElement {
    if ( !_tempCanvas ) {
        _tempCanvas = createCanvas().cvs;
    }
    return _tempCanvas;
}

/**
 * Minimise the memory allocated to the temporary canvas.
 * Call after drawing operations completed.
 */
export function clearTempCanvas(): void {
    _tempCanvas.width  = 1;
    _tempCanvas.height = 1;
}

export async function resizeImage( image: HTMLImageElement | HTMLCanvasElement | ImageBitmap, width: number, height: number ): Promise<ImageBitmap> {
    if ( image.width === width || image.height === height ) {
        return image instanceof ImageBitmap ? image : imageToBitmap( image );
    }
    imageToCanvas( getTempCanvas(), image, width, height );
    const clonedCanvas = cloneCanvas( getTempCanvas() );

    clearTempCanvas();
    
    return imageToBitmap( clonedCanvas );
}

export function cloneCanvas( canvasToClone: HTMLCanvasElement ): HTMLCanvasElement {
    const { cvs, ctx } = createCanvas( canvasToClone.width, canvasToClone.height );
    ctx.drawImage( canvasToClone, 0, 0 );
    return cvs;
}

export function imageToCanvas( cvs: HTMLCanvasElement, image: HTMLImageElement | HTMLCanvasElement | ImageBitmap, width?: number, height?: number ): void {
    drawImageOnCanvas( cvs, image, width, height );
}

export async function imageToBitmap( image: HTMLImageElement | HTMLCanvasElement | Blob ): Promise<ImageBitmap> {
    if ( image instanceof Blob ) {
        image = await blobToCanvas( image as Blob );
    }
    drawImageOnCanvas( getTempCanvas(), image );

    const bitmap = await createImageBitmap( getTempCanvas());

    clearTempCanvas();

    return bitmap;
}

export function blobToImage( blob: Blob ): Promise<HTMLImageElement> {
    const url = URL.createObjectURL( blob );
    const revoke  = (): void => {
        URL.revokeObjectURL( url );
    };
    return new Promise(( resolve, reject ) => {
        const image = new Image();
        image.onload = () => {
            revoke();
            resolve( image );
        };
        image.onerror = error => {
            revoke();
            reject( error );
        }
        image.src = url;
    });
}

/* internal methods */

/**
 * Draws given image content onto a Canvas Element, matching the original image dimensions or
 * alternatively, matching the optionall provided width and height
 */
function drawImageOnCanvas( canvas: HTMLCanvasElement, image: HTMLImageElement | HTMLCanvasElement | ImageBitmap, width?: number, height?: number ): void {
    const ctx = canvas.getContext( "2d" );

    width  = width  ?? image.width;
    height = height ?? image.height;

    canvas.width  = width;
    canvas.height = height;

    ctx.clearRect( 0, 0, width, height );
    ctx.drawImage( image, 0, 0, width, height );
}

/**
 * Draws the content of a Blob onto a Canvas Element
 */
async function blobToCanvas( blob: Blob ): Promise<HTMLCanvasElement> {
    const image = await blobToImage( blob );

    const { cvs, ctx } = createCanvas( image.width, image.height );
    ctx.drawImage( image, 0, 0 );

    return cvs;
}
