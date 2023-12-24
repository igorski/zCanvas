/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2020-2023 - https://www.igorski.nl
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
import type { TextProps } from "../IRenderer";

type MeasuredLineDef = {
    line: string;
    top: number;
};

/**
 * Renders a Layers text Object as multi line text onto given Canvas.
 */
export function renderMultiLineText( ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    lines: MeasuredLineDef[], props: TextProps, x: number, y: number ): void {
    applyTextStyleToContext( props, ctx );

    const spacing = props.spacing ?? 1;

    lines.forEach(({ line, top }) => {
        if ( !props.spacing ) {
            // write entire line
            ctx.fillText( line, x, y + top );
        } else {
            // write letter by letter (yeah... this is why we cache things)
            const letters = line.split( "" );
            letters.forEach(( letter, letterIndex ) => {
                ctx.fillText( letter, x + Math.round( letterIndex * spacing ), y + top );
            });
        }
    });
}

/**
 * Measure the bounding box occupied by lines of given text for given text properties
 *
 * @param {Object} props Layer text Object
 * @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} ctx
 * @return {{ lines: MeasuredLineDef[], width: Number, height: Number }} bounding box of the rendered text
 */
export function measureLines( props: TextProps, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D ):
    { lines: MeasuredLineDef[], width: number, height: number } {
    applyTextStyleToContext( props, ctx );

    const lines = props.text.split( "\n" );

    const linesOut: MeasuredLineDef[] = [];
    let width  = 0;
    let height = 0;

    let lineHeight: number;
    let textMetrics = ctx.measureText( "Wq" );

    // if no custom line height was given, calculate optimal height for font
    if ( props.lineHeight ) {
        lineHeight = props.lineHeight;
    } else {
        lineHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;
    }
    const topOffset = textMetrics.actualBoundingBoxAscent;
    let top = 0;

    lines.forEach(( line, lineIndex ) => {
        top = Math.round( topOffset + ( lineIndex * lineHeight ));
        if ( !props.spacing ) {
            textMetrics = ctx.measureText( line );
            width = Math.max( width, textMetrics.actualBoundingBoxRight );
        } else {
            const letters = line.split( "" );
            width = Math.max( width, letters.length * props.spacing );
        }
        linesOut.push({ line, top });
        height += lineHeight;
    });
    return {
        lines  : linesOut,
        width  : Math.ceil( width ),
        height : Math.ceil( height )
    };
}

/* internal methods */

function applyTextStyleToContext( props: TextProps, ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D ): void {
    ctx.font      = `${props.size}${props.unit} "${props.font}"`;
    ctx.fillStyle = props.color;
}
