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
import type { ImageSource, Size } from "../definitions/types";
import Loader from "../Loader";
import { readFile } from "../utils/FileUtil";
import { imageToBitmap } from "../utils/ImageUtil";
import RendererImpl from "./RendererImpl";
import type { IRenderer, DrawContext } from "./IRenderer";
// @ts-expect-error cannot handle Vite parameters for inlining as Blob
import CanvasWorker from "../workers/canvas.worker?worker&inline";

/**
 * All draw commands are executed on the RenderAPI which can delegate
 * it to a Worker (when using OffscreenCanvas) or run it inline.
 */
export default class RenderAPI implements IRenderer {
    private _element: HTMLCanvasElement;
    private _renderer: RendererImpl;
    private _worker: Worker;
    private _useWorker = false;
    private _callbacks: Map<string, { resolve: ( data?: any ) => void, reject: ( error: Error ) => void }>;

    constructor( canvas: HTMLCanvasElement, useOffscreen = false ) {
        this._element = canvas;

        if ( useOffscreen && typeof this._element[ "transferControlToOffscreen" ] === "function" ) {
            this._useWorker = true;
            this._callbacks = new Map();
            
            const offscreenCanvas = canvas.transferControlToOffscreen();
            this._worker = new CanvasWorker();

            this._worker.postMessage({
                cmd: "init",
                canvas: offscreenCanvas
            }, [ offscreenCanvas ]);
            this._worker.onmessage = this.handleMessage.bind( this );
        } else {
            this._renderer = new RendererImpl( this._element );
        }
    }

    loadResource( id: string, source: ImageSource ): Promise<Size> {
        return new Promise( async ( resolve, reject ) => {
            if ( source instanceof ImageBitmap ) {
                if ( this._useWorker ) {
                    this.wrappedWorkerLoad( id, source as ImageBitmap, resolve, reject, true );
                } else {
                    this._renderer.cacheResource( id, source );
                    resolve({ width: source.width, height: source.height });
                }
                return;
            }

            if ( typeof source === "string" ) {
                // relative paths need to be converted to absolute paths or the Worker won't be able to fetch()
                source = source.startsWith( "./" ) ? new URL( source, document.baseURI ).href : source;
                if ( this._useWorker ) {
                    this.wrappedWorkerLoad( id, source as string, resolve, reject );
                } else {
                    const image = await Loader.loadImage( source );
                    this.wrappedLoad( id, image.image, resolve, reject );
                }
                return;
            }
    
            if ( source instanceof HTMLImageElement || source instanceof HTMLCanvasElement ) {
                const bitmap = await imageToBitmap( source ); // requires conversion on main thread
                return this.loadResource( id, bitmap ).then( size => resolve( size ));
            }
            
            if ( source instanceof File ) {
                if ( this._useWorker ) {
                    this.wrappedWorkerLoad( id, source as File, resolve, reject );
                } else {
                    const blob = await readFile( source as File );
                    this.wrappedLoad( id, blob, resolve, reject );
                }
                return;
            } else if ( source instanceof Blob ) {
                if ( this._useWorker ) {
                    this.wrappedWorkerLoad( id, source as Blob, resolve, reject );
                } else {
                    this.wrappedLoad( id, source as Blob, resolve, reject );
                }
                return;
            }
            reject( "Unsupported resource type" );
        });
    }

    getResource( id: string ): Promise<ImageBitmap | undefined> {
        return new Promise(( resolve, reject ) => {
            if ( this._useWorker ) {
                this._callbacks.set( id, { resolve, reject });
                this._worker.postMessage({
                    cmd: "getResource",
                    id,
                });
            } else {
                resolve( this._renderer.getResource( id ));
            }
        });
    }

    disposeResource( id: string ): void {
        this.getBackend( "disposeResource", id );
    }

    dispose(): void {
        this.getBackend( "dispose" );

        setTimeout(() => {
            this._worker?.terminate();
            this._worker = undefined; 
            this._callbacks?.clear();
        }, 50 );
    }

    protected getBackend( cmd: string, ...args: any[] ): void {
        if ( this._useWorker ) {
            this._worker.postMessage({
                cmd,
                args: [ ...args ],
            });
            return
        }
        // @ts-expect-error TS2556: A spread argument must either have a tuple type or be passed to a rest parameter.
        this._renderer[ cmd as keyof IRenderer ]( ...args );
    }

    protected handleMessage( message: MessageEvent ): void {
        const { cmd, id } = message.data;
        switch ( cmd ) {
            default:
                break;
            case "onload":
                if ( !this._callbacks.has( id )) {
                    return;
                }
                this._callbacks.get( id ).resolve( message.data.size );
                this._callbacks.delete( id );
                break;

            case "onerror":
                if ( !this._callbacks.has( id )) {
                    return;
                }
                this._callbacks.get( id ).reject( new Error( message.data.error ));
                this._callbacks.delete( id );
                break;

            case "onresource":
                this._callbacks.get( id ).resolve( message.data.bitmap );
                this._callbacks.delete( id );
                break;
        }
    }

    private wrappedWorkerLoad( id: string, source: File | Blob | ImageBitmap | string, resolve: ( size: Size ) => void, reject: ( e?: Error ) => void, transferable = false ): void {
        this._callbacks.set( id, { resolve, reject });
        this._worker.postMessage({
            cmd: "loadResource",
            source, id,
        }, transferable ? [ source as Transferable ]: []);
    }

    private async wrappedLoad( id: string, image: HTMLImageElement | HTMLCanvasElement | Blob, resolve: ( size: Size ) => void, reject: ( e?: Error ) => void ): Promise<void> {
        try {
            const bitmap = await imageToBitmap( image );
            this._renderer.cacheResource( id, bitmap );

            resolve({ width: bitmap.width, height: bitmap.height });
        } catch ( e: any ) {
            reject( e );
        }
    }

    /* rendering API */

    // @TODO when using offscreenCanvas post messages (will be difficult with getters though...)
    // @TODO can we maybe just Proxy this upfront to prevent duplicate calls ??
    // @TODO can we just return a direct reference to the Renderer class when we're not using the offscreen canvas ???

    setDimensions( width: number, height: number ) {
        this.getBackend( "setDimensions", width, height );
    }

    setSmoothing( enabled: boolean ): void {
        this.getBackend( "setSmoothing", enabled );
    }

    save(): void {
        this.getBackend( "save" );
    }

    restore(): void {
        this.getBackend( "restore" );
    }

    scale( xScale: number, yScale?: number ): void {
        this.getBackend( "scale", xScale, yScale );
    }

    setBlendMode( type: GlobalCompositeOperation ): void {
        this.getBackend( "setBlendMode", type );
    }

    setAlpha( value: number ): void {
        this.getBackend( "setAlpha", value );
    }

    clearRect( x: number, y: number, width: number, height: number ): void {
        this.getBackend( "clearRect", x, y, width, height );
    }

    drawRect( x: number, y: number, width: number, height: number, color: string, fillType?: "fill" | "stroke" ): void {
        this.getBackend( "drawRect", x, y, width, height, color, fillType );
    }

    drawCircle( x: number, y: number, radius: number, fillColor: string, strokeColor?: string ): void {
        this.getBackend( "drawCircle", x, y, radius, fillColor, strokeColor );
    }

    drawImage( resourceId: string, x: number, y: number, width: number, height: number, drawContext?: DrawContext, ): void {
        this.getBackend( "drawImage", resourceId, x, y, width, height, drawContext );
    }

    drawImageCropped(
        resourceId: string,
        sourceX: number,
        sourceY: number,
        sourceWidth: number,
        sourceHeight: number,
        destinationX: number,
        destinationY: number,
        destinationWidth: number,
        destinationHeight: number,
        drawContext?: DrawContext,
    ): void {
        this.getBackend( "drawImageCropped",
            resourceId, sourceX, sourceY, sourceWidth, sourceHeight,
            destinationX, destinationY, destinationWidth, destinationHeight, drawContext
        );
    }

    createPattern( resourceId: string, repetition: "repeat" | "repeat-x" | "repeat-y" | "no-repeat" ): void {
        this.getBackend( "createPattern", resourceId, repetition );
    }

    drawPattern( patternResourceId: string, x: number, y: number, width: number, height: number ): void {
        this.getBackend( "drawPattern", patternResourceId, x, y, width, height );
    }
}