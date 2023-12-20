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
import type { IRenderer, DrawContext } from "./IRenderer";
import Cache from "../utils/Cache";

const HALF = 0.5;

export default class RendererImpl implements IRenderer {
    _canvas: HTMLCanvasElement | OffscreenCanvas;
    _context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    _cache: Cache<ImageBitmap>;
    _patternCache: Cache<CanvasPattern>;

    constructor( canvas: HTMLCanvasElement | OffscreenCanvas ) {
        this._canvas  = canvas;
        this._context = canvas.getContext( "2d" );

        this._cache        = new Cache();
        this._patternCache = new Cache();
    }

    dispose(): void {
        this._cache.dispose();
        this._patternCache.dispose();
        this._canvas = undefined;
    }

    /* public methods */

    cacheResource( id: string, bitmap: ImageBitmap ): void {
        this._cache.set( id, bitmap );
    }

    getResource( id: string ): ImageBitmap | undefined {
        return this._cache.get( id );
    }

    disposeResource( id: string ): void {
        this._cache.remove( id );
    }

    setDimensions( width: number, height: number ): void {
        this._canvas.width  = width;
        this._canvas.height = height;
    }

    setSmoothing( enabled: boolean ): void {
        const props = [
            "imageSmoothingEnabled",  "mozImageSmoothingEnabled",
            "oImageSmoothingEnabled", "webkitImageSmoothingEnabled"
        ];
        const context = this._context;
        
        props.forEach( prop => {
            // @ts-expect-error TS7053 expression of type 'string' can't be used to index type CanvasRenderingContext2D
            if ( context[ prop ] !== undefined ) context[ prop ] = enabled;
        });
    }

    /* IRenderer wrappers */

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

    setAlpha( value: number ): void {
        this._context.globalAlpha = value;
    }

    clearRect( x: number, y: number, width: number, height: number ): void {
        this._context.clearRect( x, y, width, height );
    }

    drawRect( x: number, y: number, width: number, height: number, color: string, fillType = "fill" ): void {
        if ( fillType === "fill" ) {
            this._context.fillStyle = color;
            this._context.fillRect( x, y, width, height );
        } else if ( fillType === "stroke" ) {
            const lineWidth = 1;
            this._context.lineWidth   = lineWidth;
            this._context.strokeStyle = color;
            this._context.strokeRect( HALF + ( x - lineWidth ), HALF + ( y - lineWidth ), width, height );
        }
    }

    drawCircle( x: number, y: number, radius: number, fillColor: string, strokeColor?: string ): void {
        this._context.beginPath();
        this._context.arc( x + radius, y + radius, radius, 0, 2 * Math.PI, false );
        this._context.fillStyle = fillColor;
        this._context.fill();

        if ( strokeColor ) {
            this._context.lineWidth = 5;
            this._context.strokeStyle = strokeColor;
            this._context.stroke();
        }
        this._context.closePath();
    }

    drawImage( resourceId: string, x: number, y: number, width?: number, height?: number ): void {
        if ( !this._cache.has( resourceId )) {
            return;
        }
        if ( width === undefined ) {
            this._context.drawImage( this._cache.get( resourceId ), x, y );
            return;
        }
        this._context.drawImage( this._cache.get( resourceId ), x, y, width, height );
    }

    drawImageCropped( resourceId: string,
        sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number,
        destinationX: number, destinationY: number, destinationWidth: number, destinationHeight: number,
        drawContext?: DrawContext,
    ): void {
        if ( !this._cache.has( resourceId )) {
            return;
        }

        // INDEX_SIZE_ERR is thrown when target dimensions are zero or negative
        // in case you are uncertain that the provided arguments are within bounds of the
        // canvas, you can use safeMode to perform the corrections

        if ( drawContext?.safeMode ) {

            if ( destinationWidth <= 0 || destinationHeight <= 0 ) {
                return;
            }

            const source = this._cache.get( resourceId );

            // clipping rectangle doesn't have to exceed <canvas> dimensions
            destinationWidth  = Math.min( this._context.canvas.width,  destinationWidth );
            destinationHeight = Math.min( this._context.canvas.height, destinationHeight );

            const xScale = destinationWidth  / sourceWidth;
            const yScale = destinationHeight / sourceHeight;

            // when clipping the source region should remain within the image dimensions

            if ( sourceX + sourceWidth > source.width ) {
                destinationWidth -= xScale * ( sourceX + sourceWidth - source.width );
                sourceWidth      -= ( sourceX + sourceWidth - source.width );
            }
            if ( sourceY + sourceHeight > source.height ) {
                destinationHeight -= yScale * ( sourceY + sourceHeight - source.height );
                sourceHeight      -= ( sourceY + sourceHeight - source.height );
            }
        }

        let saveState = false;
        // TODO clean up
        if ( drawContext ) {
            const hasScale = drawContext.scale !== undefined;
            const hasAlpha = drawContext.alpha !== undefined;
            const hasBlend = drawContext.blend !== undefined;

            // TODO rotation

            saveState = hasScale || hasAlpha || hasBlend;
            if ( saveState ) {
                this.save();
            }

            if ( hasScale ) {
                this.scale( drawContext.scale );
            }

            if ( hasBlend ) {
                this.setBlendMode( drawContext.blend );
            }

            if ( hasAlpha ) {
                this.setAlpha( drawContext.alpha );
            }
        }

        // By rounding the values we omit subpixel content which provdes a performance boost
        // Safari also greatly benefits from round numbers as subpixel content is sometimes ommitted from rendering!

        this._context.drawImage(
            this._cache.get( resourceId ),
            ( HALF + sourceX )           << 0,
            ( HALF + sourceY )           << 0,
            ( HALF + sourceWidth )       << 0,
            ( HALF + sourceHeight )      << 0,
            ( HALF + destinationX )      << 0,
            ( HALF + destinationY )      << 0,
            ( HALF + destinationWidth )  << 0,
            ( HALF + destinationHeight ) << 0
        );

        if ( saveState ) {
            this.restore();
        }
    }

    createPattern( resourceId: string, repetition: "repeat" | "repeat-x" | "repeat-y" | "no-repeat" ): void {
        if ( !this._cache.has( resourceId )) {
            return;
        }
        this._patternCache.set(
            resourceId,
            this._context.createPattern( this._cache.get( resourceId ), repetition )
        );
    }

    drawPattern( patternResourceId: string, x: number, y: number, width: number, height: number ): void {
        if ( !this._patternCache.has( patternResourceId )) {
            return;
        }
        const pattern = this._patternCache.get( patternResourceId );
        
        this._context.fillStyle = pattern;
        this._context.fillRect( x, y, width, height );
    }
}