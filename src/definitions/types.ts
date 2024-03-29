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
export type { CanvasProps } from "../Canvas";
export type { SpriteProps } from "../Sprite";
import type Sprite from "../Sprite";
export type { IRenderer, ColorOrTransparent, DrawProps, StrokeProps, TextProps } from "../rendering/IRenderer";

export type Size = {
    width: number;
    height: number;
};

export type Point = {
    x: number;
    y: number;
};

export type Rectangle = {
    left: number;
    top: number;
    width: number;
    height: number;
};

export type BoundingBox = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};

export type Viewport = BoundingBox & Size;

export type ImageSource = HTMLImageElement | HTMLCanvasElement | File | Blob | ImageData | ImageBitmap | string;

export type SpriteSheet = {
    row: number;
    col: number;
    amount: number;
    fpt: number;
    onComplete?: ( sprite: Sprite ) => void;
};
