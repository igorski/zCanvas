import { describe, it, expect, beforeEach } from "vitest";
import "vitest-canvas-mock";
import RendererImpl from "../../src/rendering/RendererImpl";
import Canvas from "../../src/Canvas";

describe( "RendererImpl", () => {
    let renderer: RendererImpl;
    let canvas: Canvas;

    beforeEach(() => {
        canvas   = new Canvas();
        renderer = new RendererImpl( canvas.getElement() );
    });

    it( "should be able to render crisp pixel art when image smoothing is disabled", () => {
        expect( canvas.getElement().getContext( "2d" )!.imageSmoothingEnabled ).toBe( false );
   
        renderer.setSmoothing( true );
     
        expect( canvas.getElement().getContext( "2d" )!.imageSmoothingEnabled ).toBe( true );
    });
});