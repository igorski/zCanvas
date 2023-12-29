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

const p = { x: 0, y: 0 };

export function toggleFullScreen( element: HTMLElement ): void {
    let requestMethod;
   
    // @ts-expect-error TS2551: vendor prefixes
    if ( element.fullscreenElement || element.webkitFullscreenElement ) {
        // @ts-expect-error TS2551: vendor prefixes
        requestMethod = element.exitFullscreen || element.webkitExitFullscreen || element.mozCancelFullScreen || element.msExitFullscreen;
    } else {
        // @ts-expect-error TS2551: vendor prefixes
        requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullscreen;
    }
  
    if ( requestMethod ) {
        requestMethod.call( element );
    }
}

/**
 * When entering fullscreen mode, the mouse pointer is not representative of its on-screen position.
 * This method will transform mouse pointers in fullscreen view to relative coordinates in the Canvas
 * 
 * NOTE this will only work when stretchToFit is set to true as the Canvas needs to be aligned to
 * the top left (0, 0) coordinate (we cannot retrieve its actual offset when in fullscreen!)
 * 
 * Based on work by Matthias Southwick
 * https://stackoverflow.com/questions/62049700/how-can-i-get-the-mouse-position-on-an-html5-canvas-when-canvas-is-fullscreen
 */
export function transformPointer( event: MouseEvent, element: HTMLCanvasElement, rect: DOMRect, canvasWidth: number, canvasHeight: number ): Point {
    /* in zCanvas, Element is/should always be the Canvas
    const element = event.target as HTMLElement;
    const rect = element.getBoundingClientRect();
    */
    const ratio  = window.innerHeight / canvasHeight;
    const offset = ( window.innerWidth - ( canvasWidth * ratio )) * 0.5;
    
    p.x = map( event.clientX - rect.left - offset, 0, canvasWidth * ratio, 0, element.width );
    p.y = map( event.clientY - rect.top, 0, canvasHeight * ratio, 0, element.height );

    return p;
}

/* internal methods */

function map( v: number, n1: number, n2: number, m1: number, m2: number ): number {
    return ( v - n1 ) / ( n2 - n1 ) * ( m2 - m1 ) + m1;
}
