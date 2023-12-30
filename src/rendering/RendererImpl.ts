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
import type { IRenderer, DrawProps, StrokeProps, TextProps } from "./IRenderer";
import type { Point } from "../definitions/types";
import { renderMultiLineText, measureLines } from "./components/TextRenderer";
import Cache from "../utils/Cache";
import { DEG_TO_RAD } from "../utils/ImageMath";

export enum ResetCommand {
    NONE = 0,
    ALL,
    TRANSFORM
};

const TRANSPARENT = "transparent";
const TWO_PI = Math.PI * 2;
const HALF = 0.5;

let _pixelRatio = 1;
let transformFn: "setTransform" | "transform" = "setTransform";

export default class RendererImpl implements IRenderer {
    _cvs: HTMLCanvasElement | OffscreenCanvas;
    _ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    _bmp: Cache<ImageBitmap>;   // cache for all image Bitmaps
    _ptn: Cache<CanvasPattern>; // cache for all Pattern Bitmaps

    constructor( canvas: HTMLCanvasElement | OffscreenCanvas, private _debug = false ) {
        this._cvs = canvas;
        this._ctx = canvas.getContext( "2d" );

        this._bmp = new Cache( undefined, ( bitmap: ImageBitmap ) => {
            bitmap.close();
        });
        this._ptn = new Cache();
    }

    dispose(): void {
        this._bmp.dispose();
        this._ptn.dispose();
        this._cvs = undefined;
    }

    /* public methods */

    cacheResource( id: string, bitmap: ImageBitmap ): void {
        this._bmp.set( id, bitmap );
    }

    getResource( id: string ): ImageBitmap | undefined {
        return this._bmp.get( id );
    }

    disposeResource( id: string ): void {
        this._bmp.remove( id );
    }

    setDimensions( width: number, height: number ): void {
        this._cvs.width  = width;
        this._cvs.height = height;
    }

    setSmoothing( enabled: boolean ): void {
        const props = [
            "imageSmoothingEnabled",  "mozImageSmoothingEnabled",
            "oImageSmoothingEnabled", "webkitImageSmoothingEnabled"
        ];
        const context = this._ctx;
        
        props.forEach( prop => {
            // @ts-expect-error TS7053 expression of type 'string' can't be used to index type CanvasRenderingContext2D
            if ( context[ prop ] !== undefined ) context[ prop ] = enabled;
        });
    }

    setPixelRatio( ratio: number ): void {
        _pixelRatio = ratio;

        // setTransform() is generally more performant, only use transform() when
        // the canvas is scaled for HDPI screens (allows easier accumulation for scaling factors)
        transformFn = _pixelRatio === 1 ? "setTransform" : "transform";
        /*
        if ( ratio !== 1 ) {
            // prescale the canvas and save it so subsequent drawing operations
            // don't need to take HDPI scaling factors into account
            this.scale( 1 );
            this.save();
        }*/
    }

    /* IRenderer wrappers */

    save(): void {
        this._ctx.save();
    }

    restore(): void {
        this._ctx.restore();
    }

    translate( x: number, y: number ): void {
        this._ctx.translate( x, y );
    }

    scale( xScale: number, yScale = xScale ): void {
        this._ctx.scale( xScale, yScale );// * _pixelRatio, yScale * _pixelRatio );
    }

    rotate( angleInRadians: number ): void {
        this._ctx.rotate( angleInRadians );
    }

    transform( a: number, b: number, c: number, d: number, e: number, f: number ): void {
        this._ctx.transform( a, b, c, d, e, f );
    }

    /* blending */

    setBlendMode( mode: GlobalCompositeOperation ): void {
        this._ctx.globalCompositeOperation = mode;
    }

    setAlpha( value: number ): void {
        this._ctx.globalAlpha = value;
    }

    /* preparation */

    createPattern( resourceId: string, repetition: "repeat" | "repeat-x" | "repeat-y" | "no-repeat" ): void {
        if ( !this._bmp.has( resourceId )) {
            return;
        }
        this._ptn.set(
            resourceId,
            this._ctx.createPattern( this._bmp.get( resourceId ), repetition )
        );
    }

    /* graphic rendering */

    drawPath( points: Point[], color = TRANSPARENT, stroke?: StrokeProps ): void {
        this._ctx.beginPath();
        this._ctx.moveTo( points[ 0 ].x, points[ 0 ].y );
            
        let point: Point;
        for ( let i = 1, l = points.length; i < l; ++i ) {
            point = points[ i ];
            this._ctx.lineTo( point.x, point.y );
        }
        if ( color !== TRANSPARENT ) {
            this._ctx.fill();
        }
        if ( stroke ) {
            applyStrokeProps( this._ctx, stroke );
            this._ctx.stroke();
        }
        // this._ctx.closePath();
    }

    clearRect( x: number, y: number, width: number, height: number, props?: DrawProps ): void {
        const prep = props ? this.prepare( props, x, y, width, height ) : ResetCommand.NONE;

        this._ctx.clearRect( x, y, width, height );

        this.applyReset( prep );
    }

    drawRect( x: number, y: number, width: number, height: number, color = TRANSPARENT, stroke?: StrokeProps, props?: DrawProps ): void {
        const prep = props ? this.prepare( props, x, y, width, height ) : ResetCommand.NONE;

        if ( color !== TRANSPARENT ) {
            this._ctx.fillStyle = color;
            this._ctx.fillRect( x, y, width, height );
        }
        if ( stroke ) {
            applyStrokeProps( this._ctx, stroke );
            this._ctx.strokeRect( HALF + x, HALF + y, width, height );
        }
        this.applyReset( prep );
    }

    drawRoundRect( x: number, y: number, width: number, height: number, radius: number, color = TRANSPARENT, stroke?: StrokeProps, props?: DrawProps ): void {
        const prep = props ? this.prepare( props, x, y, width, height ) : ResetCommand.NONE;

        this._ctx.beginPath();
   
        if ( color !== TRANSPARENT ) {
            this._ctx.fillStyle = color;
            this._ctx.roundRect( x, y, width, height, radius );
            this._ctx.fill();
        }
        if ( stroke ) {
            applyStrokeProps( this._ctx, stroke );
            this._ctx.roundRect( HALF + x, HALF + y, width, height, radius );
            this._ctx.stroke();
        }
        this.applyReset( prep );
    }

    drawCircle( x: number, y: number, radius: number, fillColor = TRANSPARENT, stroke?: StrokeProps, props?: DrawProps ): void {
        const prep = props ? this.prepare( props, x, y, radius * 2, radius * 2 ) : ResetCommand.NONE;

        this._ctx.beginPath();
        this._ctx.arc( x + radius, y + radius, radius, 0, TWO_PI, false );

        if ( fillColor !== TRANSPARENT ) {
            this._ctx.fillStyle = fillColor;
            this._ctx.fill();
        }

        if ( stroke ) {
            applyStrokeProps( this._ctx, stroke );
            // ctx.closePath();
            this._ctx.stroke();
        }
        this.applyReset( prep );
    }

    drawEllipse( x: number, y: number, xRadius: number, yRadius: number, fillColor = TRANSPARENT, stroke?: StrokeProps, props?: DrawProps ): void {
        const prep = props ? this.prepare( props, x, y, xRadius * 2, yRadius * 2 ) : ResetCommand.NONE;

        this._ctx.beginPath();
        this._ctx.ellipse( x, y, xRadius, yRadius, 0, 0, TWO_PI, false );

        if ( fillColor !== TRANSPARENT ) {
            this._ctx.fillStyle = fillColor;
            this._ctx.fill();
        }

        if ( stroke ) {
            applyStrokeProps( this._ctx, stroke );
            // ctx.closePath();
            this._ctx.stroke();
        }
        this.applyReset( prep );
    }

    drawImage( resourceId: string, x: number, y: number, width?: number, height?: number, props?: DrawProps ): void {
        if ( !this._bmp.has( resourceId )) {
            return;
        }
        const prep = props ? this.prepare( props, x, y, width, height ) : ResetCommand.NONE;

        if ( width === undefined ) {
            this._ctx.drawImage( this._bmp.get( resourceId ), x, y );
        } else {
            this._ctx.drawImage( this._bmp.get( resourceId ), x, y, width, height );
        }
        if ( this._debug ) {
            this.drawRect( x, y, width, height, TRANSPARENT, { size: 1, color: "red" });
        }
        this.applyReset( prep );
    }

    drawImageCropped( resourceId: string,
        sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number,
        destinationX: number, destinationY: number, destinationWidth: number, destinationHeight: number,
        props?: DrawProps,
    ): void {
        if ( !this._bmp.has( resourceId )) {
            return;
        }

        // INDEX_SIZE_ERR is thrown when target dimensions are zero or negative
        // in case you are uncertain that the provided arguments are within bounds of the
        // canvas, you can use safeMode to perform the corrections

        if ( props?.safeMode ) {

            if ( destinationWidth <= 0 || destinationHeight <= 0 ) {
                return;
            }
            const source = this._bmp.get( resourceId );

            // clipping rectangle doesn't have to exceed <canvas> dimensions
            destinationWidth  = Math.min( this._ctx.canvas.width,  destinationWidth );
            destinationHeight = Math.min( this._ctx.canvas.height, destinationHeight );

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

        const prep = props ? this.prepare( props, destinationX, destinationY, destinationWidth, destinationHeight ) : ResetCommand.NONE;

        // By rounding the values we omit subpixel content which provdes a performance boost
        // Safari also greatly benefits from round numbers as subpixel content is sometimes ommitted from rendering!

        this._ctx.drawImage(
            this._bmp.get( resourceId ),
            ( HALF + sourceX )           << 0,
            ( HALF + sourceY )           << 0,
            ( HALF + sourceWidth )       << 0,
            ( HALF + sourceHeight )      << 0,
            ( HALF + destinationX )      << 0,
            ( HALF + destinationY )      << 0,
            ( HALF + destinationWidth )  << 0,
            ( HALF + destinationHeight ) << 0
        );

        if ( this._debug ) {
            this.drawRect( destinationX, destinationY, destinationWidth, destinationHeight, TRANSPARENT, { size: 1, color: "red" });
        }
        this.applyReset( prep );
    }

    drawText( text: TextProps, x: number, y: number, props?: DrawProps ): void {
        // measure bounding box, this also applies the text style
        const { lines, width, height } = measureLines( text, this._ctx );

        // render text from the center of the coordinate
        if ( text.center ) {
            x -= ( width  * HALF );
            y -= ( height * HALF );
        }
        const prep = props ? this.prepare( props, x, y, width, height ) : ResetCommand.NONE;

        renderMultiLineText( this._ctx, lines, text, x, y );
   
        this.applyReset( prep );
    }

    drawPattern( patternResourceId: string, x: number, y: number, width: number, height: number ): void {
        if ( !this._ptn.has( patternResourceId )) {
            return;
        }
        const pattern = this._ptn.get( patternResourceId );
        
        this._ctx.fillStyle = pattern;
        this._ctx.fillRect( x, y, width, height );
    }

    /* internal methods */

    protected prepare( props: DrawProps, x: number, y: number, width: number, height: number ): ResetCommand {
        const hasScale    = props.scale !== 1;
        const hasRotation = props.rotation !== 0;
        const hasAlpha    = props.alpha !== 1;
        const hasBlend    = props.blendMode !== undefined;

        const mustSave      = hasAlpha || hasBlend;
        const mustTransform = hasScale || hasRotation;

        if ( mustSave ) {
            this.save();
        } else if ( !mustTransform ) {
            return ResetCommand.NONE; // nothing to do
        }

        if ( mustTransform ) {
            const scale = props.scale ?? 1;

            const centerX = props.pivot?.x ?? x + width  * HALF;
            const centerY = props.pivot?.y ?? y + height * HALF;

            const rotation = props.rotation * DEG_TO_RAD;

            const cos = Math.cos( rotation ) * scale;
            const sin = Math.sin( rotation ) * scale;

            // Apply the combined transformation matrix using setTransform
            this._ctx[ transformFn ]( cos, sin, -sin, cos,
                centerX - centerX * cos + centerY * sin,
                centerY - centerX * sin - centerY * cos
            );
        }

        if ( hasBlend ) {
            this.setBlendMode( props.blendMode );
        }

        if ( hasAlpha ) {
            this.setAlpha( props.alpha );
        }
        return mustSave ? ResetCommand.ALL : ResetCommand.TRANSFORM;
    }

    protected applyReset( cmd: ResetCommand ): void {
        if ( cmd === ResetCommand.TRANSFORM ) {
            this._ctx.setTransform( _pixelRatio, 0, 0, _pixelRatio, 0, 0 );
        } else if ( cmd === ResetCommand.ALL ) {
            this.restore();
        }
    }
}

/* internal methods */

function applyStrokeProps( ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, props: StrokeProps ): void {
    ctx.lineWidth   = props.size;
    ctx.strokeStyle = props.color;
    if ( props.cap ) {
        ctx.lineCap = props.cap;
    }
    if ( props.dash ) {
        ctx.setLineDash( props.dash );
    }
}
