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
import { type IRenderer } from "./IRenderer";
import type Cache from "../utils/cache";

const HALF = .5;

export default class Renderer implements IRenderer {
    _context: CanvasRenderingContext2D;
    _cache: Cache;

    constructor( context: CanvasRenderingContext2D, cache: Cache ) {
        this._context = context;
        this._cache = cache;
    }

    /* public methods */

    getBackingStoreRatio(): number {
        const ctx = this._context;

        return ctx.webkitBackingStorePixelRatio ||
                  ctx.mozBackingStorePixelRatio ||
                   ctx.msBackingStorePixelRatio ||
                    ctx.oBackingStorePixelRatio ||
                     ctx.backingStorePixelRatio || 1;
    }

    setSmoothing( enabled: boolean ): void {
        // 1. context smoothing state
        const props = [
            "imageSmoothingEnabled",  "mozImageSmoothingEnabled",
            "oImageSmoothingEnabled", "webkitImageSmoothingEnabled"
        ];

        // 2. canvas rendering CSS style
        const styles = [
            "-moz-crisp-edges", "-webkit-crisp-edges", "pixelated", "crisp-edges"
        ];

        const context     = this._context;
        const canvasStyle = context.canvas.style;
        
        props.forEach( prop => {
            if ( context[ prop ] !== undefined ) {
                context[ prop ] = enabled;
            }
        });
        styles.forEach( style => {
            canvasStyle[ "image-rendering" ] = enabled ? undefined : style;
        });
    }

    save(): void {
        this._context.save();
    }

    restore(): void {
        this._context.restore();
    }

    scale( xScale: number, yScale = xScale ): void {
        this._context.scale( xScale, yScale );
    }

    setBlendMode( mode: GlobalCompositeOperation ): void {
        this._context.globalCompositeOperation = mode;
    }

    clearRect( x: number, y: number, width: number, height: number ): void {
        this._context.clearRect( x, y, width, height );
    }

    drawRect( x: number, y: number, width: number, height: number, color: string, fillType = "fill" ): void {
        if ( fillType === "fill" ) {
            this._context.fillStyle = color;
            this._context.fillRect( x, y, width, height );
        } else if ( fillType === "stroke" ) {
            this._context.lineWidth   = 1;
            this._context.strokeStyle = color;
            this._context.strokeRect( x, y, width, height );
        }
    }

    drawImage( bitmap: ImageBitmap, x: number, y: number, width?: number, height?: number ): void {
        this._context.drawImage( bitmap, x, y, width, height );
    }

    drawImageCropped( bitmap: ImageBitmap,
        sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number,
        destinationX: number, destinationY: number, destinationWidth: number, destinationHeight: number
    ): void {
        this._context.drawImage(
            bitmap, // TODO via Cache key identifier!!
            ( HALF + sourceX )           << 0,
            ( HALF + sourceY )           << 0,
            ( HALF + sourceWidth )       << 0,
            ( HALF + sourceHeight )      << 0,
            ( HALF + destinationX )      << 0,
            ( HALF + destinationY )      << 0,
            ( HALF + destinationWidth )  << 0,
            ( HALF + destinationHeight ) << 0
        );
    }
}