import { describe, it, expect } from "vitest";
import { isInsideViewport, calculateDrawRectangle } from "../../src/utils/ImageMath";

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
            expect( isInsideViewport( spriteBounds, viewport )).toBe( false );
        });

        it( "should know when a sprite positioned at the edges, is visible inside the viewport", () => {
            // will be just inside horizontal and vertical viewport bounds
            const spriteBounds = {
                left: 49,
                top: 49,
                width: 1,
                height: 1
            };
            expect( isInsideViewport( spriteBounds, viewport )).toBe( true );
        });

        it( "should know when a sprite centered inside the viewport is visible", () => {
            const spriteBounds = {
                left: 250,
                top: 250,
                width: 20,
                height: 20
            };
            expect( isInsideViewport( spriteBounds, viewport )).toBe( true );
        });

        it( "should know when a sprite positioned at the top is visible inside the viewport", () => {
            const spriteBounds = {
                left: 0,
                top: 49,
                width: 100,
                height: 1
            };
            expect( isInsideViewport( spriteBounds, viewport )).toBe( true );
        });

        it( "should know when a sprite positioned at the bottom is visible inside the viewport", () => {
            const spriteBounds = {
                left: 0,
                top: 450,
                width: 100,
                height: 1
            };
            expect( isInsideViewport( spriteBounds, viewport )).toBe( true );
        });

        it( "should know when a sprite positioned at the left is visible inside the viewport", () => {
            const spriteBounds = {
                left: 40,
                top: 49,
                width: 10,
                height: 1
            };
            expect( isInsideViewport( spriteBounds, viewport )).toBe( true );
        });

        it( "should know when a sprite positioned at the right is visible inside the viewport", () => {
            const spriteBounds = {
                left: 450,
                top: 49,
                width: 1,
                height: 1
            };
            expect( isInsideViewport( spriteBounds, viewport )).toBe( true );
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
});
