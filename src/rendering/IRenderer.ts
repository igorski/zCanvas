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

/**
 * Below interface exposes a unified API to perform drawing
 * actions on a CanvasRenderingContext2D instance.
 */
export interface IRenderer {
    save(): void
    restore(): void
    scale( xScale: number, yScale?: number ): void
    setBlendMode( type: GlobalCompositeOperation ): void
    setAlpha( value: number ): void

    clearRect( x: number, y: number, width: number, height: number ): void;
    drawRect( x: number, y: number, width: number, height: number, color: string | CanvasGradient | CanvasPattern, fillType?: "fill" | "stroke" ): void
    drawCircle( x: number, y: number, radius: number, fillColor: string, strokeColor?: string ): void
    drawImage(
        resourceId: string,
        x: number,
        y: number,
        width?: number,
        height?: number
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
};

// when these are set, save() and restore() will be applied as appropriate
// during image drawing

export type DrawContext = {
    scale?: number;
    rotation?: number;
    alpha?: number;
    blend?: GlobalCompositeOperation;
    safeMode?: boolean;
};
