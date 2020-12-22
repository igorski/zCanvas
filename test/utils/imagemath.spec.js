import { calculateDrawRectangle } from "../../src/utils/ImageMath";

describe( "Image math utilities", () => {
    describe( "when calculating the drawable area rectangle", () => {
        const viewportX      = 50;
        const viewportY      = 50;
        const viewportWidth  = 400;
        const viewportHeight = 400;

        describe( "for a small Sprite positioned within a panned viewport", () => {
            it( "should be able to draw a small Sprite in the horizontal and vertical center of a panned viewport", () => {
                const spriteBounds = {
                    left: 250,
                    top: 250,
                    width: 20,
                    height: 20
                };
                const { source, dest } = calculateDrawRectangle( spriteBounds, viewportX, viewportY, viewportWidth, viewportHeight );
                expect( source ).toEqual({
                    left: 0,
                    top: 0,
                    width: 20,
                    height: 20
                });
                expect( dest ).toEqual({
                    left: 250,
                    top: 250,
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
                const { source, dest } = calculateDrawRectangle( spriteBounds, viewportX, viewportY, viewportWidth, viewportHeight );
                expect( source ).toEqual({
                    left: 10,
                    top: 10,
                    width: 10,
                    height: 10
                });
                expect( dest ).toEqual({
                    left: viewportX,
                    top: viewportY,
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
                const { source, dest } = calculateDrawRectangle( spriteBounds, viewportX, viewportY, viewportWidth, viewportHeight );
                expect( source ).toEqual({
                    left: 0,
                    top: 10,
                    width: 20,
                    height: 10
                });
                expect( dest ).toEqual({
                    left: 250,
                    top: viewportY,
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
                const { source, dest } = calculateDrawRectangle( spriteBounds, viewportX, viewportY, viewportWidth, viewportHeight );
                expect( source ).toEqual({
                    left: 0,
                    top: 10,
                    width: 10,
                    height: 10
                });
                expect( dest ).toEqual({
                    left: 440,
                    top: viewportY,
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
                const { source, dest } = calculateDrawRectangle( spriteBounds, viewportX, viewportY, viewportWidth, viewportHeight );
                expect( source ).toEqual({
                    left: 10,
                    top: 0,
                    width: 10,
                    height: 10
                });
                expect( dest ).toEqual({
                    left: viewportX,
                    top: 440,
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
                const { source, dest } = calculateDrawRectangle( spriteBounds, viewportX, viewportY, viewportWidth, viewportHeight );
                expect( source ).toEqual({
                    left: 0,
                    top: 0,
                    width: 20,
                    height: 10
                });
                expect( dest ).toEqual({
                    left: 250,
                    top: 440,
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
                const { source, dest } = calculateDrawRectangle( spriteBounds, viewportX, viewportY, viewportWidth, viewportHeight );
                expect( source ).toEqual({
                    left: 0,
                    top: 0,
                    width: 10,
                    height: 10
                });
                expect( dest ).toEqual({
                    left: 440,
                    top: 440,
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

                const { source, dest } = calculateDrawRectangle( spriteBounds, viewportX, viewportY, viewportWidth, viewportHeight );
                expect( source ).toEqual({
                    left: viewportX,
                    top: viewportY,
                    width: viewportWidth,
                    height: viewportHeight
                });
                expect( dest ).toEqual({
                    left: viewportX,
                    top: viewportY,
                    width: viewportWidth,
                    height: viewportHeight
                });
            });

            it( "should be able to draw only the visible area of a full Canvas-size, inside positioned Sprite within a panned viewport", () => {
                const spriteBounds = {
                    left: 100,
                    top: 80,
                    width: 800,
                    height: 500
                };

                const { source, dest } = calculateDrawRectangle( spriteBounds, viewportX, viewportY, viewportWidth, viewportHeight );
                expect( source ).toEqual({
                    left: 0,
                    top: 0,
                    width: 350,
                    height: 370
                });
                expect( dest ).toEqual({
                    left: 100,
                    top: 80,
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

                const { source, dest } = calculateDrawRectangle( spriteBounds, viewportX, viewportY, viewportWidth, viewportHeight );
                expect( source ).toEqual({
                    left: 100,
                    top: 0,
                    width: viewportWidth,
                    height: 100
                });
                expect( dest ).toEqual({
                    left: viewportX,
                    top: 350,
                    width: viewportWidth,
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

                const { source, dest } = calculateDrawRectangle( spriteBounds, viewportX, viewportY, viewportWidth, viewportHeight );
                expect( source ).toEqual({
                    left: 0,
                    top: 100,
                    width: 150,
                    height: viewportHeight
                });
                expect( dest ).toEqual({
                    left: 300,
                    top: viewportY,
                    width: 150,
                    height: viewportHeight
                });
            });

            it( "should be able to draw only the visible area of a full Canvas-size, vertically and horizontally negative positioned Sprite within a panned viewport", () => {
                const spriteBounds = {
                    left: -150,
                    top: -300,
                    width: 300,
                    height: 600
                };

                const { source, dest } = calculateDrawRectangle( spriteBounds, viewportX, viewportY, viewportWidth, viewportHeight );
                expect( source ).toEqual({
                    left: 200,
                    top: 350,
                    width: 100,
                    height: 250
                });
                expect( dest ).toEqual({
                    left: viewportX,
                    top: viewportY,
                    width: 100,
                    height: 250
                });
            });
        });
    });
});
