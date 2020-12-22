/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2020 - https://www.igorski.nl
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
 * Determines whether a Sprites bounding box is visible within the current viewport.
 *
 * @param {{ left: number, top: number, width: number, height: number }} spriteBounds
 * @param {{ left: number, top: number, width: number, height: number }} viewport
 * @return {boolean}
 */
export const isInsideViewport = ( spriteBounds, viewport ) => {
    const { left, top } = spriteBounds;
    return ( left + spriteBounds.width )  >= viewport.left && left <= viewport.right &&
           ( top  + spriteBounds.height ) >= viewport.top  && top  <= viewport.bottom;
};

/**
 * If the zCanvas is inside a smaller, pannable viewport we can omit drawing a
 * Sprites unseen pixels by calculating the visible area from both the source
 * drawable and destination canvas context.
 *
 * NOTE: the returned destination coordinates are relative to the canvas, not the viewport !
 * As such this can directly be used with CanvasRenderingContext2D.drawImage()
 *
 * @param {{ left: number, top: number, width: number, height: number }} spriteBounds
 * @param {{ left: number, top: number, width: number, height: number }} viewport
 * @return {{ source: Object, dest: Object }}
 */
export const calculateDrawRectangle = ( spriteBounds, viewport ) => {
    let { left, top, width, height } = spriteBounds;
    const {
        left: viewportX,
        top: viewportY,
        width: viewportWidth,
        height: viewportHeight
    } = viewport;

    // NOTE: for the source we don't have to take image scaling into account
    // as the source is always drawn at the same scale relative to the canvas / viewpor
    // see unbounded render behaviour in Sprite.draw()

    if ( left > viewportX ) {
        width = Math.min( width, viewportWidth - ( left - viewportX ));
    } else {
        width = Math.min( viewportWidth, width - ( viewportX - left ));
    }
    if ( top > viewportY ) {
        height = Math.min( height, viewportHeight - ( top - viewportY ));
    } else {
        height = Math.min( viewportHeight, height - ( viewportY - top ));
    }

    return {
        src: {
            // NOTE by default all Sprites draw their content from top left coordinate
            // we only correct for this if the visible area starts within the viewport
            left : left > viewportX ? 0 : viewportX - left,
            top  : top  > viewportY ? 0 : viewportY - top,
            width,
            height
        },
        dest: {
            left : Math.max( left, viewportX ),
            top  : Math.max( top,  viewportY ),
            width,
            height
        }
    };
};
