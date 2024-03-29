/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2020-2022 - https://www.igorski.nl
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
import type { Rectangle, Size, BoundingBox, Viewport } from "../definitions/types";

const { min, max } = Math;
const HALF = 0.5;

let left: number;
let top: number;
let width: number;
let height: number;

// multiplier to convert an angle in degrees to radians
export const DEG_TO_RAD = Math.PI / 180;

export function fastRound( num: number ): number {
    return num > 0 ? ( num + .5 ) << 0 : num | 0;
}

/**
 * Determines whether provided Rectangle is visible within provided BoundingBox
 */
export function isInsideArea( rect: Rectangle, area: BoundingBox ): boolean {
    ({ left, top } = rect );
    return ( left + rect.width )  >= area.left && left <= area.right &&
           ( top  + rect.height ) >= area.top  && top  <= area.bottom;
}

/**
 * If the full zCanvas "document" is represented inside a smaller, pannable viewport
 * we can omit drawing a Sprites unseen pixels by calculating the visible area from both
 * the source drawable and destination canvas context.
 *
 * NOTE: this method should be used on sprites that are inside the viewports current
 * bounds (e.g. use after isInsideViewport( spriteBounds, viewport ))
 *
 * NOTE: the returned destination coordinates are relative to the canvas, not the viewport !
 * As such this can directly be used with IRenderer.drawImage()
 */
export function calculateDrawRectangle( spriteBounds: Rectangle, viewport: Viewport ): { src: Rectangle, dest: Rectangle } {
    ({ left, top, width, height } = spriteBounds );
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
        width = min( width, viewportWidth - ( left - viewportX ));
    } else {
        width = min( viewportWidth, width - ( viewportX - left ));
    }
    if ( top > viewportY ) {
        height = min( height, viewportHeight - ( top - viewportY ));
    } else {
        height = min( viewportHeight, height - ( viewportY - top ));
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
            left : left > viewportX ? left - viewportX : 0,
            top  : top  > viewportY ? top  - viewportY : 0,
            width,
            height
        }
    };
}

/**
 * when stretching, the non-dominant side of the preferred rectangle will scale to reflect the
 * ratio of the available space, while the dominant side remains at its current size.
 */
export function constrainAspectRatio( idealWidth: number, idealHeight: number, availableWidth: number, availableHeight: number ): Size {
    const idealAspectRatio  = idealWidth / idealHeight;
    const screenAspectRatio = availableWidth / availableHeight;

    let width  = idealWidth;
    let height = idealHeight;

    if ( idealAspectRatio > screenAspectRatio ) {
        // the ideal is landscape oriented
        height = idealWidth / screenAspectRatio;
    } else {
        // the ideal is portrait or square oriented
        width = idealHeight * screenAspectRatio;
    }
    return { width, height };
}

/**
 * Transform given Rectangle by given angle and scale. Argument outRectangle
 * can be a reference to a cached Rectangle to minimise garbage collector overhead.
 */
export function transformRectangle( rectangle: Rectangle, angleInDegrees: number, scale: number, outRectangle: Rectangle ): Rectangle {
    if ( angleInDegrees === 0 && scale === 1 ) {
        return scaleRectangle( rectangle, 1, outRectangle ); // aligns rectangle contents
    }
    const { left, top, width, height } = scaleRectangle( rectangle, scale, outRectangle );

    if ( angleInDegrees !== 0 ) {

        const x1 = -width  * HALF,
              x2 = width   * HALF,
              x3 = width   * HALF,
              x4 = -width  * HALF,
              y1 = height  * HALF,
              y2 = height  * HALF,
              y3 = -height * HALF,
              y4 = -height * HALF;

        const angleInRadians = angleInDegrees * DEG_TO_RAD;

        const cos = Math.cos( angleInRadians );
        const sin = Math.sin( angleInRadians );

        const x11 = x1  * cos + y1 * sin,
              y11 = -x1 * sin + y1 * cos,
              x21 = x2  * cos + y2 * sin,
              y21 = -x2 * sin + y2 * cos,
              x31 = x3  * cos + y3 * sin,
              y31 = -x3 * sin + y3 * cos,
              x41 = x4  * cos + y4 * sin,
              y41 = -x4 * sin + y4 * cos;

        const xMin = min( x11, x21, x31, x41 ),
              xMax = max( x11, x21, x31, x41 ),
              yMin = min( y11, y21, y31, y41 ),
              yMax = max( y11, y21, y31, y41 );

        outRectangle.width  = xMax - xMin;
        outRectangle.height = yMax - yMin;
        outRectangle.left   = left - ( outRectangle.width  * HALF - width  * HALF );
        outRectangle.top    = top  - ( outRectangle.height * HALF - height * HALF );
    }
    return outRectangle;
}

/**
 * Scale given rectangle by provided factor and apply the values upon provided outRectangle
 */
function scaleRectangle( rectangle: Rectangle, factor: number, outRectangle: Rectangle ): Rectangle {
    const { left, top, width, height } = rectangle;

    outRectangle.width  = width  * factor;
    outRectangle.height = height * factor;
    outRectangle.left   = left - (( outRectangle.width  - width )  * HALF );
    outRectangle.top    = top  - (( outRectangle.height - height ) * HALF );

    return outRectangle;
}
