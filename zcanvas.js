/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-2022 Igor Zinken https://www.igorski.nl
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
import canvas from "./src/Canvas.js";
import sprite from "./src/Sprite.js";
import loader from "./src/Loader.js";
import { pixelCollision, getChildrenUnderPoint, cache, hasCache, clearCache } from "./src/Collision.js";
import { isInsideViewport } from "./src/utils/image-math.js";

/**
 * @typedef {{ width: number, height: number }} Size
 * @typedef {{ x: number, y: number }} Point
 * @typedef {{ left: number, top: number, width: number, height: number }} Rectangle
 * @typedef {{ size: Size, image: HTMLImageElement }} SizedImage
 *
 * @typedef {{
 *     left: number,
 *     top: number,
 *     width: number,
 *     height: number,
 *     right: number,
 *     bottom: number
 * }} Viewport
 *
 * @typedef {{
 *      row: number,
 *      col: number,
 *      amount: number,
 *      fpt: 5,
 *      onComplete?: () => void
 *  }} SpriteSheet
 *
 * @typedef {{
 *    src: Rectangle,
 *    dest: Rectangle
 * }} TransformedDrawBounds
 */

const collision = {
    pixelCollision,
    getChildrenUnderPoint,
    cache,
    hasCache,
    clearCache,
    isInsideViewport,
};

export {
    canvas,
    sprite,
    loader,
    collision,
};
