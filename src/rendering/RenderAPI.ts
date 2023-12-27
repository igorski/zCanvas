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
import type { ImageSource, Point, Size } from "../definitions/types";
import Loader from "../Loader";
import { readFile } from "../utils/FileUtil";
import { imageToBitmap } from "../utils/ImageUtil";
import RendererImpl from "./RendererImpl";
import type { IRenderer, ColorOrTransparent, DrawProps, StrokeProps, TextProps } from "./IRenderer";
// @ts-expect-error cannot handle Vite parameters for inlining as Blob
import CanvasWorker from "../workers/canvas.worker?worker&inline";
import Cache from "../utils/Cache";

type DrawCommand = ( string | number | DrawProps )[];

/**
 * All draw commands are executed on the RenderAPI which can delegate
 * it to a Worker (when using OffscreenCanvas) or run it inline.
 */
export default class RenderAPI implements IRenderer {
    private _element: HTMLCanvasElement;
    private _renderer: RendererImpl;

    // when using Workers, we use a post messaging interface which requires a callback system
    // additionally, we send draw commands in batches to minimise overhead of structured cloning
    // command lists and command items are pooled in a Cache to prevent garbage collector hit

    private _worker: Worker;
    private _useWorker = false;
    private _pool: Cache<DrawCommand>;
    private _commands: DrawCommand[];
    private _callbacks: Map<string, { resolve: ( data?: any ) => void, reject: ( error: Error ) => void }>;

    constructor( canvas: HTMLCanvasElement, useOffscreen = false, debug = false ) {
        this._element = canvas;

        if ( useOffscreen && typeof this._element[ "transferControlToOffscreen" ] === "function" ) {
            this._useWorker = true;
            this._callbacks = new Map();
            this._pool = new Cache(() => ([]), ( cmd: DrawCommand ) => {
                cmd.length = 0;
            });
            this._pool.fill( 1000 ); // allocate memory to hold at least this amount of commands
            this._commands = [];
            
            const offscreenCanvas = canvas.transferControlToOffscreen();
            this._worker = new CanvasWorker();

            this._worker.postMessage({
                cmd: "init",
                canvas: offscreenCanvas,
                debug,
            }, [ offscreenCanvas ]);
            this._worker.onmessage = this.handleMessage.bind( this );
        } else {
            this._renderer = new RendererImpl( this._element, debug );
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
            reject( "Unsupported resource type: " + typeof source );
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

    onCommandsReady(): void {
        if ( !this._useWorker ) {
            return; // commands have been executed synchronously in non-Worker version
        }
        this._worker.postMessage({
            cmd: "render",
            commands: this._commands,
        });
        this._commands.length = 0; // commands have been sent to Worker using structured cloning
        this._pool.reset(); // reset Pool for next render cycle
    }

    dispose(): void {
        this.getBackend( "dispose" );

        setTimeout(() => {
            this._worker?.terminate();
            this._worker = undefined; 
            this._callbacks?.clear();
        }, 50 );
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

    /* IRenderer interface - setup API */

    setDimensions( width: number, height: number ) {
        this.getBackend( "setDimensions", width, height );
    }

    createPattern( resourceId: string, repetition: "repeat" | "repeat-x" | "repeat-y" | "no-repeat" ): void {
        this.getBackend( "createPattern", resourceId, repetition );
    }

    setSmoothing( enabled: boolean ): void {
        this.getBackend( "setSmoothing", enabled );
    }

    /* IRenderer interface - draw API */

    // @TODO can we maybe just Proxy this upfront to prevent duplicate calls ??
    // @TODO can we just return a direct reference to the Renderer class when we're not using the offscreen canvas ???

    save(): void {
        this.onDraw( "save" );
    }

    restore(): void {
        this.onDraw( "restore" );
    }

    translate( x: number, y: number ): void {
        this.onDraw( "translate", x, y );
    }

    rotate( angleInRadians: number ): void {
        this.onDraw( "rotate", angleInRadians );
    }

    transform( a: number, b: number, c: number, d: number, e: number, f: number ): void {
        this.onDraw( "transform", a, b, c, d, e, f );
    }

    scale( xScale: number, yScale?: number ): void {
        this.onDraw( "scale", xScale, yScale );
    }

    setBlendMode( type: GlobalCompositeOperation ): void {
        this.onDraw( "setBlendMode", type );
    }

    setAlpha( value: number ): void {
        this.onDraw( "setAlpha", value );
    }

    drawPath( points: Point[], color?: ColorOrTransparent, stroke?: StrokeProps ): void {
        this.onDraw( "drawPath", points, color, stroke );
    }

    clearRect( x: number, y: number, width: number, height: number, props?: DrawProps ): void {
        this.onDraw( "clearRect", x, y, width, height, props );
    }

    drawRect( x: number, y: number, width: number, height: number, color?: ColorOrTransparent, stroke?: StrokeProps, props?: DrawProps ): void {
        this.onDraw( "drawRect", x, y, width, height, color, stroke, props );
    }

    drawRoundRect( x: number, y: number, width: number, height: number, radius: number, color?: ColorOrTransparent, stroke?: StrokeProps, props?: DrawProps ): void {
        this.onDraw( "drawRoundRect", x, y, width, height, radius, color, stroke, props );
    }

    drawCircle( x: number, y: number, radius: number, fillColor = "transparent", stroke?: StrokeProps, props?: DrawProps ): void {
        this.onDraw( "drawCircle", x, y, radius, fillColor, stroke, props );
    }

    drawImage( resourceId: string, x: number, y: number, width: number, height: number, props?: DrawProps ): void {
        this.onDraw( "drawImage", resourceId, x, y, width, height, props );
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
        props?: DrawProps,
    ): void {
        this.onDraw( "drawImageCropped",
            resourceId, sourceX, sourceY, sourceWidth, sourceHeight,
            destinationX, destinationY, destinationWidth, destinationHeight, props
        );
    }

    drawText( text: TextProps, x: number, y: number, props?: DrawProps ): void {
        this.onDraw( "drawText", text, x, y, props );
    }

    drawPattern( patternResourceId: string, x: number, y: number, width: number, height: number ): void {
        this.onDraw( "drawPattern", patternResourceId, x, y, width, height );
    }

    /* Proxies for interacting with the renderer using the appropriate backend */

    protected onDraw( cmd: string, ...args: any[] ): void {
        // Worker receives all its commands in a single batch
        if ( this._useWorker ) {
            const command = this._pool.next();
            command.length = 0;
            command.push( cmd, ...args );
            this._commands.push( command );
            return;
        }
        // @ts-expect-error TS2556: A spread argument must either have a tuple type or be passed to a rest parameter.
        this._renderer[ cmd as keyof IRenderer ]( ...args );
    }

    protected getBackend( cmd: string, ...args: any[] ): void {
        if ( this._useWorker ) {
            return this._worker.postMessage({
                cmd,
                args: [ ...args ],
            });
        }
        // @ts-expect-error TS2556: A spread argument must either have a tuple type or be passed to a rest parameter.
        this._renderer[ cmd as keyof IRenderer ]( ...args );
    }
}
