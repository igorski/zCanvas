import { describe, it, expect, beforeEach } from "vitest";
import type { Rectangle } from "../../src/definitions/types";
import {
    isInsideArea, constrainAspectRatio,
    calculateDrawRectangle, transformRectangle,
} from "../../src/utils/ImageMath";

describe( "Image math utilities", () => {
    const viewport = {
        left   : 50,
        top    : 50,
        width  : 400,
        height : 400,
        right  : 450,
        bottom : 450
    };

    describe( "when determining whether a sprite is visible within the current viewport", () => {
        it( "should know when a sprite close to the edges is not visible inside the viewport", () => {
            // will be 1 pixel out of horizontal and vertical viewport bounds
            const spriteBounds = {
                left: 48,
                top: 48,
                width: 1,
                height: 1
            };
            expect( isInsideArea( spriteBounds, viewport )).toBe( false );
        });

        it( "should know when a sprite positioned at the edges, is visible inside the viewport", () => {
            // will be just inside horizontal and vertical viewport bounds
            const spriteBounds = {
                left: 49,
                top: 49,
                width: 1,
                height: 1
            };
            expect( isInsideArea( spriteBounds, viewport )).toBe( true );
        });

        it( "should know when a sprite centered inside the viewport is visible", () => {
            const spriteBounds = {
                left: 250,
                top: 250,
                width: 20,
                height: 20
            };
            expect( isInsideArea( spriteBounds, viewport )).toBe( true );
        });

        it( "should know when a sprite positioned at the top is visible inside the viewport", () => {
            const spriteBounds = {
                left: 0,
                top: 49,
                width: 100,
                height: 1
            };
            expect( isInsideArea( spriteBounds, viewport )).toBe( true );
        });

        it( "should know when a sprite positioned at the bottom is visible inside the viewport", () => {
            const spriteBounds = {
                left: 0,
                top: 450,
                width: 100,
                height: 1
            };
            expect( isInsideArea( spriteBounds, viewport )).toBe( true );
        });

        it( "should know when a sprite positioned at the left is visible inside the viewport", () => {
            const spriteBounds = {
                left: 40,
                top: 49,
                width: 10,
                height: 1
            };
            expect( isInsideArea( spriteBounds, viewport )).toBe( true );
        });

        it( "should know when a sprite positioned at the right is visible inside the viewport", () => {
            const spriteBounds = {
                left: 450,
                top: 49,
                width: 1,
                height: 1
            };
            expect( isInsideArea( spriteBounds, viewport )).toBe( true );
        });
    });

    describe( "when calculating the drawable area rectangle", () => {
        describe( "for a small Sprite positioned within a panned viewport", () => {
            it( "should be able to draw a small Sprite in the horizontal and vertical center of a panned viewport", () => {
                const spriteBounds = {
                    left: 250,
                    top: 250,
                    width: 20,
                    height: 20
                };
                const { src, dest } = calculateDrawRectangle( spriteBounds, viewport );
                expect( src ).toEqual({
                    left: 0,
                    top: 0,
                    width: 20,
                    height: 20
                });
                expect( dest ).toEqual({
                    left: 200, // == (spriteBounds.left - viewport.left)
                    top: 200,  // == (spriteBounds.top - viewport.top)
                    width: 20,
                    height: 20
                });
            });
        });

        describe( "for a small Sprite partially positioned within a panned viewport", () => {

            it( "should be able to draw a small Sprite on the top left of a panned viewport", () => {
                const spriteBounds = {
                    left: 40,
                    top: 40,
                    width: 20,
                    height: 20
                };
                const { src, dest } = calculateDrawRectangle( spriteBounds, viewport );
                expect( src ).toEqual({
                    left: 10,
                    top: 10,
                    width: 10,
                    height: 10
                });
                expect( dest ).toEqual({
                    left: 0, // == (spriteBounds.left - viewport.left) < viewport.left, therefor 0
                    top: 0,  // == (spriteBounds.top - viewport.top) < viewport.top, therefor 0
                    width: 10,
                    height: 10
                });
            });

            it( "should be able to draw a small Sprite in the horizontal center and top of a panned viewport", () => {
                const spriteBounds = {
                    left: 250,
                    top: 40,
                    width: 20,
                    height: 20
                };
                const { src, dest } = calculateDrawRectangle( spriteBounds, viewport );
                expect( src ).toEqual({
                    left: 0,
                    top: 10,
                    width: 20,
                    height: 10
                });
                expect( dest ).toEqual({
                    left: 200, // == (spriteBounds.left - viewport.left)
                    top: 0,    // == (spriteBounds.top - viewport.top) < viewport.top, therefor 0
                    width: 20,
                    height: 10
                });
            });

            it( "should be able to draw a small Sprite on the top right of a panned viewport", () => {
                const spriteBounds = {
                    left: 440,
                    top: 40,
                    width: 20,
                    height: 20
                };
                const { src, dest } = calculateDrawRectangle( spriteBounds, viewport );
                expect( src ).toEqual({
                    left: 0,
                    top: 10,
                    width: 10,
                    height: 10
                });
                expect( dest ).toEqual({
                    left: 390, // == (spriteBounds.left - viewport.left)
                    top: 0,    // == (spriteBounds.top - viewport.top) < viewport.top, therefor 0
                    width: 10,
                    height: 10
                });
            });

            it( "should be able to draw a small Sprite on the bottom left of a panned viewport", () => {
                const spriteBounds = {
                    left: 40,
                    top: 440,
                    width: 20,
                    height: 20
                };
                const { src, dest } = calculateDrawRectangle( spriteBounds, viewport );
                expect( src ).toEqual({
                    left: 10,
                    top: 0,
                    width: 10,
                    height: 10
                });
                expect( dest ).toEqual({
                    left: 0,  // == (spriteBounds.left - viewport.left) < viewport.left, therefor 0
                    top: 390, // == (spriteBounds.top - viewport.top)
                    width: 10,
                    height: 10
                });
            });

            it( "should be able to draw a small Sprite in the horizontal center and bottom of a panned viewport", () => {
                const spriteBounds = {
                    left: 250,
                    top: 440,
                    width: 20,
                    height: 20
                };
                const { src, dest } = calculateDrawRectangle( spriteBounds, viewport );
                expect( src ).toEqual({
                    left: 0,
                    top: 0,
                    width: 20,
                    height: 10
                });
                expect( dest ).toEqual({
                    left: 200, // == (spriteBounds.left - viewport.left)
                    top: 390,  // == (spriteBounds.top - viewport.top)
                    width: 20,
                    height: 10
                });
            });

            it( "should be able to draw a small Sprite on the bottom right of a panned viewport", () => {
                const spriteBounds = {
                    left: 440,
                    top: 440,
                    width: 20,
                    height: 20
                };
                const { src, dest } = calculateDrawRectangle( spriteBounds, viewport );
                expect( src ).toEqual({
                    left: 0,
                    top: 0,
                    width: 10,
                    height: 10
                });
                expect( dest ).toEqual({
                    left: 390, // == (spriteBounds.left - viewport.left)
                    top: 390,  // == (spriteBounds.top - viewport.top)
                    width: 10,
                    height: 10
                });
            });
        });

        describe( "for a large Sprite larger than the current viewport", () => {
            it( "should be able to draw only the visible area of a full Canvas-size, top-left positioned Sprite within a panned viewport", () => {
                const spriteBounds = {
                    left: 0,
                    top: 0,
                    width: 800,
                    height: 500
                };

                const { src, dest } = calculateDrawRectangle( spriteBounds, viewport );
                expect( src ).toEqual({
                    left: viewport.left,
                    top: viewport.top,
                    width: viewport.width,
                    height: viewport.height
                });
                expect( dest ).toEqual({
                    left: 0, // == (spriteBounds.left - viewport.left) < viewport.left, therefor 0
                    top: 0,  // == (spriteBounds.top - viewport.top) < viewport.top, therefor 0
                    width: viewport.width,
                    height: viewport.height
                });
            });

            it( "should be able to draw only the visible area of a full Canvas-size, inside positioned Sprite within a panned viewport", () => {
                const spriteBounds = {
                    left: 100,
                    top: 80,
                    width: 800,
                    height: 500
                };

                const { src, dest } = calculateDrawRectangle( spriteBounds, viewport );
                expect( src ).toEqual({
                    left: 0,
                    top: 0,
                    width: 350,
                    height: 370
                });
                expect( dest ).toEqual({
                    left: 50, // == (spriteBounds.left - viewport.left)
                    top: 30,  // == (spriteBounds.top - viewport.top)
                    width: 350,
                    height: 370
                });
            });

            it( "should be able to draw only the visible area of a full Canvas-size, horizontally negative positioned Sprite within a panned viewport", () => {
                const spriteBounds = {
                    left: -50,
                    top: 350,
                    width: 800,
                    height: 500
                };

                const { src, dest } = calculateDrawRectangle( spriteBounds, viewport );
                expect( src ).toEqual({
                    left: 100,
                    top: 0,
                    width: viewport.width,
                    height: 100
                });
                expect( dest ).toEqual({
                    left: 0,  // == (spriteBounds.left - viewport.left) < viewport.left, therefor 0
                    top: 300, // == (spriteBounds.top - viewport.top)
                    width: viewport.width,
                    height: 100
                });
            });

            it( "should be able to draw only the visible area of a full Canvas-size, vertically negative positioned Sprite within a panned viewport", () => {
                const spriteBounds = {
                    left: 300,
                    top: -50,
                    width: 800,
                    height: 500
                };

                const { src, dest } = calculateDrawRectangle( spriteBounds, viewport );
                expect( src ).toEqual({
                    left: 0,
                    top: 100,
                    width: 150,
                    height: viewport.height
                });
                expect( dest ).toEqual({
                    left: 250,  // == (spriteBounds.left - viewport.left)
                    top: 0,     // == (spriteBounds.top - viewport.top) < viewport.top, therefor 0
                    width: 150,
                    height: viewport.height
                });
            });

            it( "should be able to draw only the visible area of a full Canvas-size, vertically and horizontally negative positioned Sprite within a panned viewport", () => {
                const spriteBounds = {
                    left: -150,
                    top: -300,
                    width: 300,
                    height: 600
                };

                const { src, dest } = calculateDrawRectangle( spriteBounds, viewport );
                expect( src ).toEqual({
                    left: 200,
                    top: 350,
                    width: 100,
                    height: 250
                });
                expect( dest ).toEqual({
                    left: 0,
                    top: 0,
                    width: 100, // == (spriteBounds.left + spriteBounds.width) - viewport.width)
                    height: 250
                });
            });
        });
    });

    describe( "when scaling a bounding box to reflect a constrained aspect ratio", () => {
        describe( "and the ideal bounding box is in a landscape orientation", () => {
            const idealWidth  = 400;
            const idealHeight = 300;

            it( "should keep the input size equal when the available size is of the same ratio", () => {
                const availableWidth  = idealWidth * 2;
                const availableHeight = idealHeight * 2;

                const { width, height } = constrainAspectRatio( idealWidth, idealHeight, availableWidth, availableHeight );

                expect( width ).toEqual( idealWidth );
                expect( height ).toEqual( idealHeight );
            });

            it( "should keep the dominant side equal and scale the other, when the available size is of the same orientation, but different ratio", () => {
                const availableWidth  = 700;
                const availableHeight = 600;

                const { width, height } = constrainAspectRatio( idealWidth, idealHeight, availableWidth, availableHeight );

                expect( width ).toEqual( idealWidth );
                expect( Math.round( height )).toEqual( 343 );
            });

            it( "should keep the dominant side equal and scale the other, when the available size is of a different orientation", () => {
                const availableWidth  = 500;
                const availableHeight = 700;

                const { width, height } = constrainAspectRatio( idealWidth, idealHeight, availableWidth, availableHeight );

                expect( width ).toEqual( idealWidth );
                expect( Math.round( height )).toEqual( 560 );
            });
        });

        describe( "and the ideal bounding box is in a portrait orientation", () => {
            const idealWidth  = 300;
            const idealHeight = 400;

            it( "should keep the input size equal when the available size is of the same ratio", () => {
                const availableWidth  = idealWidth * 2;
                const availableHeight = idealHeight * 2;

                const { width, height } = constrainAspectRatio( idealWidth, idealHeight, availableWidth, availableHeight );

                expect( width ).toEqual( idealWidth );
                expect( height ).toEqual( idealHeight );
            });

            it( "should keep the dominant side equal and scale the other, when the available size is of the same orientation, but different ratio", () => {
                const availableWidth  = 600;
                const availableHeight = 700;

                const { width, height } = constrainAspectRatio( idealWidth, idealHeight, availableWidth, availableHeight );

                expect( Math.round( width )).toEqual( 343 );
                expect( height ).toEqual( idealHeight );
            });

            it( "should keep the dominant side equal and scale the other, when the available size is of a different orientation", () => {
                const availableWidth  = 700;
                const availableHeight = 600;

                const { width, height } = constrainAspectRatio( idealWidth, idealHeight, availableWidth, availableHeight );

                expect( Math.round( width )).toEqual( 467 );
                expect( height ).toEqual( idealHeight );
            });
        });

        describe( "and the ideal bounding box is in a square orientation", () => {
            const idealWidth  = 300;
            const idealHeight = 300;

            it( "should keep the input size equal when the available size is of the same ratio", () => {
                const availableWidth  = idealWidth * 2;
                const availableHeight = idealHeight * 2;

                const { width, height } = constrainAspectRatio( idealWidth, idealHeight, availableWidth, availableHeight );

                expect( width ).toEqual( idealWidth );
                expect( height ).toEqual( idealHeight );
            });

            it( "should scale the vertical side when the available size is in a portrait orientation", () => {
                const availableWidth  = 600;
                const availableHeight = 700;

                const { width, height } = constrainAspectRatio( idealWidth, idealHeight, availableWidth, availableHeight );

                expect( width ).toEqual( idealWidth );
                expect( Math.round( height )).toEqual( 350 );
            });

            it( "should scale the horizontal side when the available size is in a landscape orientation", () => {
                const availableWidth  = 700;
                const availableHeight = 600;

                const { width, height } = constrainAspectRatio( idealWidth, idealHeight, availableWidth, availableHeight );

                expect( Math.round( width )).toEqual( 350 );
                expect( height ).toEqual( idealHeight );
            });
        });
    });

    describe( "when transforming a Rectangle", () => {
        const left   = 10;
        const top    = 10;
        const width  = 20;
        const height = 10;

        let input: Rectangle;
        let output: Rectangle;

        beforeEach(() => {
            input  = { left, top, width, height };
            output = { left: 0, top: 0, width: 0, height: 0 };
        });

        it( "should return the input unchanged when the scale and rotation are both neutral", () => {
            const transformed = transformRectangle( input, 0, 1, output );

            expect( transformed ).toEqual({ left, top, width, height });
        });

        it( "should keep the input unchanged and apply the changes to the provided output when scaling", () => {
            const transformed = transformRectangle( input, 0, 1.5, output );

            expect( transformed ).toEqual( output );
            expect( input ).toEqual({ left, top, width, height });
        });

        it( "should keep the input unchanged and apply the changes to the provided output when rotating", () => {
            const transformed = transformRectangle( input, 45, 1, output );

            expect( transformed ).toEqual( output );
            expect( input ).toEqual({ left, top, width, height });
        });

        it( "should transform the provided rectangle by the provided scale factor", () => {
            const transformed = transformRectangle( input, 0, 1.5, output );

            expect( transformed ).toEqual({
                left: 5,
                top: 7.5,
                width: 30,
                height: 15
            });
        });

        it( "should transform the provided rectangle by the provided rotation factor", () => {
            const transformed = transformRectangle( input, 90, 1, output );

            expect( Math.round( transformed.left )).toEqual( 15 );
            expect( Math.round( transformed.top )).toEqual( 5 );
            expect( Math.round( transformed.width )).toEqual( 10 );
            expect( Math.round( transformed.height )).toEqual( 20 );
        });

        it( "should transform the provided rectangle by both provided rotation and scale factors", () => {
            const transformed = transformRectangle( input, 90, 2, output );

            expect( Math.round( transformed.left )).toEqual( 10 );
            expect( Math.round( transformed.top )).toEqual( -5 );
            expect( Math.round( transformed.width )).toEqual( 20 );
            expect( Math.round( transformed.height )).toEqual( 40 );
        });
    })
});
