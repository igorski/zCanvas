import { describe, it, expect, beforeEach, vi } from "vitest";
import "vitest-canvas-mock";
import RendererImpl, { ResetCommand } from "../../src/rendering/RendererImpl";
import Canvas from "../../src/Canvas";

describe( "RendererImpl", () => {
    let renderer: RendererImpl;
    let canvas: Canvas;
    let ctx: CanvasRenderingContext2D;

    beforeEach(() => {
        canvas   = new Canvas();
        renderer = new RendererImpl( canvas.getElement() );

        ctx = renderer._ctx as CanvasRenderingContext2D;
    });

    it( "should be able to render crisp pixel art when image smoothing is disabled", () => {
        expect( canvas.getElement().getContext( "2d" )!.imageSmoothingEnabled ).toBe( true );
   
        renderer.setSmoothing( false );
     
        expect( canvas.getElement().getContext( "2d" )!.imageSmoothingEnabled ).toBe( false );
    });

    describe( "when scaling the Canvas context", () => {
        it( "should use the x value when y hasn't been provided", () => {
            const ctxScaleSpy = vi.spyOn( ctx, "scale" );

            renderer.scale( 3.5 );

            expect( ctxScaleSpy ).toHaveBeenCalledWith( 3.5, 3.5 );
        });

        it( "should use the provided values", () => {
            const ctxScaleSpy = vi.spyOn( ctx, "scale" );

            renderer.scale( 2, 3 );

            expect( ctxScaleSpy ).toHaveBeenCalledWith( 2, 3 );
        });

        it( "should not multiply the scale by the configured pixel ratio (as the Canvas dimensions make up for HDPI scaling)", () => {
            const ctxScaleSpy = vi.spyOn( ctx, "scale" );

            renderer.setPixelRatio( 2.5 );
            renderer.scale( 2, 3 );

            expect( ctxScaleSpy ).toHaveBeenCalledWith( 2, 3 );
        });
    });

    describe( "when drawing a Path", () => {
        const points = [
            // unclosed triangle
            { x: 0, y: 0 }, { x: 10, y: 30 }, { x: -10, y: 30 }
        ];

        it( "should first move to the first supplied coordinate, then make lines to the next", () => {
            const moveToSpy = vi.spyOn( ctx, "moveTo" );
            const lineToSpy = vi.spyOn( ctx, "lineTo" );

            renderer.drawPath( points );

            expect( moveToSpy ).toHaveBeenCalledTimes( 1 );
            expect( lineToSpy ).toHaveBeenCalledTimes( 2 );

            expect( moveToSpy ).toHaveBeenCalledWith( 0, 0 );
            expect( lineToSpy ).toHaveBeenNthCalledWith( 1, 10, 30 );
            expect( lineToSpy ).toHaveBeenNthCalledWith( 2, -10, 30 );
        });

        it( "should only fill the path when a non transparent fill color was provided", () => {
            const ctxFillSpy = vi.spyOn( ctx, "fill" );

            renderer.drawPath( points, "transparent", { color: "red", size: 1 });
            expect( ctxFillSpy ).not.toHaveBeenCalled();

            renderer.drawPath( points, "blue", { color: "red", size: 1 });
            expect( ctxFillSpy ).toHaveBeenCalled();
        });

        it( "should not close the path unless explicitly requested", () => {
            const ctxCloseSpy = vi.spyOn( ctx, "closePath" );

            renderer.drawPath( points, "blue", { color: "red", size: 1 });

            expect( ctxCloseSpy ).not.toHaveBeenCalled();
        });

        it( "should close the path when requested", () => {
            const ctxCloseSpy = vi.spyOn( ctx, "closePath" );

            renderer.drawPath( points, "blue", { color: "red", size: 1, close: true });

            expect( ctxCloseSpy ).toHaveBeenCalled();
        });
    });

    describe( "when managing transformation and blending operations for a DrawProps definition", () => {
        const x = 20, y = 10, width = 30, height = 15;

        let setTransformSpy;
        let saveSpy;
        let restoreSpy;

        beforeEach(() => {
            setTransformSpy = vi.spyOn( ctx, "setTransform" );
            saveSpy = vi.spyOn( ctx, "save" );
            restoreSpy = vi.spyOn( ctx, "restore" );
        });

        it( "should not do anything where no transformation or blending operation is specified", () => {
            // @ts-expect-error snooping on protected property
            const resetCommand = renderer.prepare({
                scale: 1,
                rotation: 0,
                alpha: 1,
                blendMode: undefined,
            }, x, y, width, height );

            expect( resetCommand ).toEqual( ResetCommand.NONE );
            expect( saveSpy ).not.toHaveBeenCalled();
            expect( setTransformSpy ).not.toHaveBeenCalled();
        });

        it( "should save the context state when an alpha change is specified", () => {
            const setAlphaSpy = vi.spyOn( renderer, "setAlpha" );

            // @ts-expect-error snooping on protected property
            const resetCommand = renderer.prepare({
                scale: 1,
                rotation: 0,
                alpha: 0.5,
                blendMode: undefined,
            }, x, y, width, height );

            expect( resetCommand ).toEqual( ResetCommand.ALL );
            expect( saveSpy ).toHaveBeenCalled();
            expect( setTransformSpy ).not.toHaveBeenCalled();
            expect( setAlphaSpy ).toHaveBeenCalledWith( 0.5 );
        });

        it( "should save the context state when a blend mode change is specified", () => {
            const setBlendModeSpy = vi.spyOn( renderer, "setBlendMode" );

            // @ts-expect-error snooping on protected property
            const resetCommand = renderer.prepare({
                scale: 1,
                rotation: 0,
                alpha: 1,
                blendMode: "destination-in",
            }, x, y, width, height );

            expect( resetCommand ).toEqual( ResetCommand.ALL );
            expect( saveSpy ).toHaveBeenCalled();
            expect( setTransformSpy ).not.toHaveBeenCalled();
            expect( setBlendModeSpy ).toHaveBeenCalledWith( "destination-in" );
        });

        it( "should transform the context state using setTransform() when a scale change is specified", () => {
            // @ts-expect-error snooping on protected property
            const resetCommand = renderer.prepare({
                scale: 0.9,
                rotation: 0,
                alpha: 1,
                blendMode: undefined,
            }, x, y, width, height );

            expect( resetCommand ).toEqual( ResetCommand.TRANSFORM );
            expect( saveSpy ).not.toHaveBeenCalled();
            expect( setTransformSpy ).toHaveBeenCalled();
        });

        it( "should transform the context state using transform() when a scale change is specified and running on an HDPI screen", () => {
            const transformSpy = vi.spyOn( ctx, "transform" );

            renderer.setPixelRatio( 3 );

            // @ts-expect-error snooping on protected property
            const resetCommand = renderer.prepare({
                scale: 0.9,
                rotation: 0,
                alpha: 1,
                blendMode: undefined,
            }, x, y, width, height );

            expect( resetCommand ).toEqual( ResetCommand.TRANSFORM );
            expect( saveSpy ).not.toHaveBeenCalled();
            expect( setTransformSpy ).not.toHaveBeenCalled();
            expect( transformSpy ).toHaveBeenCalled();
        });

        it( "should transform the context state when a rotation change is specified", () => {
            // @ts-expect-error snooping on protected property
            const resetCommand = renderer.prepare({
                scale: 1,
                rotation: 45,
                alpha: 1,
                blendMode: undefined,
            }, x, y, width, height );

            expect( resetCommand ).toEqual( ResetCommand.TRANSFORM );
            expect( saveSpy ).not.toHaveBeenCalled();
            expect( setTransformSpy ).toHaveBeenCalled();
        });

        it( "should save and transform the context state when both transformation and blend mode changes are specified", () => {
            // @ts-expect-error snooping on protected property
            const resetCommand = renderer.prepare({
                scale: 0.5,
                rotation: 45,
                alpha: 0.7,
                blendMode: "destination-in",
            }, x, y, width, height );

            expect( resetCommand ).toEqual( ResetCommand.ALL );
            expect( saveSpy ).toHaveBeenCalled();
            expect( setTransformSpy ).toHaveBeenCalled();
        });

        describe( "and resetting the Context state", () => {
            it( "should reset the transformation when only transformations were applied, respecting the configured pixel ratio as scale factor", () => {
                renderer.setPixelRatio( 2.65 );

                // @ts-expect-error snooping on protected method
                renderer.applyReset( ResetCommand.TRANSFORM );

                expect( setTransformSpy ).toHaveBeenCalledWith( 2.65, 0, 0, 2.65, 0, 0 );
                expect( restoreSpy ).not.toHaveBeenCalled();
            });

            it( "should reset the context when specified", () => {
                // @ts-expect-error snooping on protected method
                renderer.applyReset( ResetCommand.ALL );

                expect( setTransformSpy ).not.toHaveBeenCalled();
                expect( restoreSpy ).toHaveBeenCalled();
            });

            it( "should not do anything when no reset instructions were specified", () => {
                // @ts-expect-error snooping on protected method
                renderer.applyReset( ResetCommand.NONE );

                expect( setTransformSpy ).not.toHaveBeenCalled();
                expect( restoreSpy ).not.toHaveBeenCalled();
            });
        });
    });
});