/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2023 - https://www.igorski.nl
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
import RendererImpl from "../rendering/RendererImpl";
import { type IRenderer } from "../rendering/IRenderer";
import { readFile } from "../utils/FileUtil";

let renderer: RendererImpl | undefined;
let canvas: OffscreenCanvas | undefined;

onmessage = ( e: MessageEvent ): void => {
    switch ( e.data.cmd ) {
        default:
            break;
        
        case "init":
            canvas = e.data.canvas;
            renderer = new RendererImpl( canvas! );
            console.info ( "--- initialized Worker",canvas,renderer);
            break;

        case "loadResource":
            loadResource( e.data.id, e.data.source );
            break;

        case "getResource":
            const bitmap = renderer?.getResource( e.data.id );
            postMessage({ cmd: "onresource", id: e.data.id, bitmap });
            break;

        case "disposeResource":
            // @ts-expect-error TS2556: A spread argument must either have a tuple type or be passed to a rest parameter.
            renderer?.disposeResource( ...e.data.args );
            break;

        case "dispose":
            renderer?.dispose();
            canvas   = undefined;
            renderer = undefined;
            break;

        // IRenderer API
        case "setSmoothing":
        case "setDimensions":
        case "save":
        case "restore":
        case "scale":
        case "setBlendMode":
        case "clearRect":
        case "drawRect":
        case "drawImage":
        case "drawImageCropped":
            // @ts-expect-error TS2556: A spread argument must either have a tuple type or be passed to a rest parameter.
            renderer && renderer[ ( e.data.cmd as keyof IRenderer )]( ...e.data.args );
            break;
    }
};

/* internal methods */

async function loadResource( id: string, source: File | Blob | ImageBitmap | string ): Promise<void> {
    try {
        let bitmap: ImageBitmap;

        if ( source instanceof File ) {
            const blob = await readFile( source as File );
            bitmap = await createImageBitmap( blob );
        } else if ( source instanceof Blob ) {
            bitmap = await createImageBitmap( source as Blob );
        } else if ( typeof source === "string" ) {
            const response = await fetch( source as string );
            const blob = await response.blob()
            bitmap = await createImageBitmap( blob );
        } else if ( source instanceof ImageBitmap ) {
            bitmap = source as ImageBitmap;
        }
        renderer?.cacheResource( id, bitmap! );
        postMessage({ cmd: "onload", id, size: { width: bitmap!.width, height: bitmap!.height } });
    } catch {
        postMessage({ cmd: "onerror", id });
    }
}