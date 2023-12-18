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
import Renderer from "./Renderer";
import Cache from "../utils/cache";
import { type IRenderer } from "./IRenderer";

export default class RenderAPI implements IRenderer {
    private _element: HTMLCanvasElement;
    private _renderer: IRenderer;
    private _worker: Worker;

    constructor( canvas: HTMLCanvasElement, useOffscreen = false ) {
        this._element = canvas;
        
        if ( useOffscreen && typeof this._element[ "transferControlToOffscreen" ] === "function" ) {
            const offscreenCanvas = canvas.transferControlToOffscreen();
            
            this._worker = new Worker( "./workers/canvas.worker.js" );
            this._worker.postMessage({
                cmd: "register",
                canvas: offscreenCanvas
            }, [ offscreenCanvas ]);
        } else {
            this._renderer = new Renderer( canvas.getContext( "2d" ), new Cache());
        }
    }

    /* public methods */

    // @TODO when using offscreenCanvas post messages (will be difficult with getters though...)
    // @TODO can we just return a direct reference to the Renderer class when we're not using the offscreen canvas ???

    getBackingStoreRatio(): number {
        return this._renderer.getBackingStoreRatio();
    }

    setSmoothing( enabled: boolean ): void {
        this._renderer.setSmoothing( enabled );
    }

    save(): void {
        this._renderer.save();
    }

    restore(): void {
        this._renderer.restore();
    }

    scale( xScale: number, yScale?: number ): void {
        this._renderer.scale( xScale, yScale );
    }

    setBlendMode( type: GlobalCompositeOperation ): void {
        this._renderer.setBlendMode( type );
    }

    clearRect( x: number, y: number, width: number, height: number ): void {
        this._renderer.clearRect( x, y, width, height );
    }

    drawRect( x: number, y: number, width: number, height: number, color: string, fillType?: "fill" | "stroke" ): void {
        this._renderer.drawRect( x, y, width, height, color, fillType );
    }

    drawImage( bitmap: ImageBitmap, x: number, y: number, width: number, height: number ): void {
        this._renderer.drawImage( bitmap, x, y, width, height );
    }

    drawImageCropped(
        bitmap: ImageBitmap,
        sourceX: number,
        sourceY: number,
        sourceWidth: number,
        sourceHeight: number,
        destinationX: number,
        destinationY: number,
        destinationWidth: number,
        destinationHeight: number
    ): void {
        this._renderer.drawImageCropped(
            bitmap, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight
        );
    }
}