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
import type { Point } from "../definitions/types";

/**
 * Below interface exposes a unified API to perform drawing
 * actions on a CanvasRenderingContext2D instance.
 */
export interface IRenderer {
    // these are supplied for maximum compatibility, however for a performance gain
    // it is recommended to use DrawContext objects supplied to the draw-commands instead
    // as they are optimized to use less state changing instruction on the Canvas

    save(): void
    restore(): void
    translate( x: number, y: number ): void
    rotate( angleInRadians: number ): void;
    transform( a: number, b: number, c: number, d: number, e: number, f: number ): void;

    // E.O. compatibility section

    scale( xScale: number, yScale?: number ): void
    setBlendMode( type: GlobalCompositeOperation ): void
    setAlpha( value: number ): void

    clearRect( x: number, y: number, width: number, height: number ): void;
    drawRect( x: number, y: number, width: number, height: number, color: string, fillType?: "fill" | "stroke" ): void
    drawRoundRect( x: number, y: number, width: number, height: number, radius: number, color: string, fillType?: "fill" | "stroke" ): void
    drawCircle( x: number, y: number, radius: number, fillColor?: string, strokeColor?: string ): void
    drawImage(
        resourceId: string,
        x: number,
        y: number,
        width?: number,
        height?: number,
        drawContext?: DrawContext,
    ): void
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
    ): void

    createPattern( resourceId: string, repetition: "repeat" | "repeat-x" | "repeat-y" | "no-repeat" ): void
    drawPattern( patternResourceId: string, x: number, y: number, width: number, height: number ): void
};

// when these are set, save() and restore() will be applied as appropriate
// during image drawing

export type DrawContext = {
    scale?: number;
    rotation?: number;
    pivot?: Point;
    alpha?: number;
    blendMode?: GlobalCompositeOperation;
    safeMode?: boolean;
};
