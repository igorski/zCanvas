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
 * If the zCanvas is inside a smaller, pannable viewport we can omit drawing unseen
 * pixels by calculating the visible area from both the source drawable and
 * destination canvas context.
 *
 * NOTE: the returned destination coordinates are relative to the canvas, not the viewport !
 * As such this can directly be used with CanvasRenderingContext2D.drawImage()
 *
 * @return {{ source: Object, dest: Object }}
 */
export const calculateDrawRectangle = ( spriteBounds, viewportX, viewportY, viewportWidth, viewportHeight ) => {
    let { left, top, width, height } = spriteBounds;

    const sourceWidthLargerThanViewport  = width  > viewportWidth;
    const sourceHeightLargerThanViewport = height > viewportHeight;

    const right  = left + width; // TODO: just cache this in Sprite.setBounds() ?
    const bottom = top + height;
    const viewportRight  = viewportX + viewportWidth;
    const viewportBottom = viewportY + viewportHeight;

    // by default all Sprites draw their content from top left coordinate see Sprite.draw() for unbounded render
    let srcLeft = 0;
    let srcTop  = 0;
    let destLeft = viewportX;
    let destTop  = viewportY;

    if ( sourceWidthLargerThanViewport ) {
        if ( left <= 0 ) {
            width   = left + width;
            srcLeft = viewportX - left;
        } else if ( left > 0 ) {
            width    = viewportWidth - ( left - viewportX  );
            destLeft = Math.max( left, viewportX );
        }
    } else if ( left < viewportX ) {
        srcLeft = viewportX - left;
        width  -= srcLeft;
    } else if ( right > viewportRight ) {
        width    -= ( viewportWidth + viewportX - left );
        destLeft += ( viewportWidth - width );
    } else {
        destLeft += viewportWidth / 2;
    }

    if ( sourceHeightLargerThanViewport ) {
        if ( top <= 0 ) {
            height = top + height;
            srcTop = viewportY - top;
        } else {
            height  = viewportHeight - ( top - viewportY );
            destTop = Math.max( top, viewportY );
        }
    } else if ( top < viewportY ) {
        srcTop = viewportY - top;
        height -= srcTop;
    } else if ( bottom > viewportBottom ) {
        height  -= ( viewportHeight + viewportY - top );
        destTop += ( viewportHeight - height );
    } else if ( !sourceHeightLargerThanViewport ) {
        destTop += viewportHeight / 2;
    }

    // for the source we don't have to take image scaling into account
    // as the source is always drawn at the same scale relative to the canvas / viewpor
    // see Sprite.draw() for unbounded render

    width  = Math.min( viewportWidth, width );
    height = Math.min( viewportHeight, height );

//  TRY TO OPTIMIZE USING THE BELOW:
// srcL == 0 if left is visible iside viewport
// srcW == width - (Math.abs( left ) + viewportX)
// height is visible height Math.min( viewportHeight, ((top - height) - viewportY))

    const source = {
        left : srcLeft,
        top  : srcTop,
        width,
        height
    };
    const dest = {
        left: destLeft,
        top: destTop,
        width,
        height
    };
    return {
        source,
        dest
    };
};
