import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import "vitest-canvas-mock";
import Canvas from "../src/Canvas";
import Sprite from "../src/Sprite";
import type { IRenderer } from "../src/rendering/IRenderer";
import { createMockRenderer } from "./__mocks";

const mockMathFn = vi.fn();
vi.mock('../src/utils/ImageMath', () => ({
    isInsideViewport       : ( ...args ) => mockMathFn?.( "isInsideViewport", ...args ),
    calculateDrawRectangle : ( ...args ) => mockMathFn?.( "calculateDrawRectangle", ...args ),
    isInsideArea           : ( ...args ) => mockMathFn?.( "isInsideArea", ...args ),
}));

describe( "Sprite", () => {

    /* setup */

    const resourceId = "foo";

    let canvas: Canvas;
    let x: number;
    let y: number;
    let width: number;
    let height: number;
    let collidable: boolean;
    let mask: boolean;

    // executed before the tests start running

    beforeAll( () => {
        // prepare Canvas
        canvas = new Canvas({ width: 200, height: 200 });
    });

    // executed before each individual test

    beforeEach( () => {
        // generate random values for coordinates and dimensions
        x      = Math.round( Math.random() * 100 ) + 1;
        y      = Math.round( Math.random() * 100 ) + 1;
        width  = Math.round( Math.random() * 100 ) + 10;
        height = Math.round( Math.random() * 100 ) + 10;

        // random values for optional properties
        collidable = ( Math.random() > .5 );
        mask       = ( Math.random() > .5 );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it( "should construct with a single data Object", () => {
        const interactive = Math.random() > .5;
        const sprite = new Sprite({
            x, y, width, height, collidable, mask, interactive, resourceId,
        });

        expect( sprite.getX() ).toEqual( x );
        expect( sprite.getY() ).toEqual( y );
        expect( sprite.getWidth() ).toEqual( width );
        expect( sprite.getHeight() ).toEqual( height );
        expect( sprite.getResourceId() ).toEqual( resourceId );
        expect( sprite.collidable ).toEqual( collidable );
        expect( sprite.getInteractive() ).toEqual( interactive );
        expect( sprite._mask ).toEqual( mask );
    });

    it( "should not construct without valid dimensions specified", () => {
        expect(() => {
            new Sprite({ width: 0, height: 0 });
        }).toThrow( /cannot construct a Sprite without valid dimensions/ );

        expect(() => {
            new Sprite({ width: -1, height: -1 });
        }).toThrow( /cannot construct a Sprite without valid dimensions/ );

        expect(() => {
            new Sprite({ width: 10, height: 10 });
        }).not.toThrow();
    });

    it( "should not construct with a spritesheet if no resource id was specified", () => {
        expect(() => {
            new Sprite({ width, height, sheet: [ {} ] });
        }).toThrow( /cannot use a spritesheet without a valid resource id/ );

        expect(() => {
            new Sprite({ width, height, resourceId, sheet: [ {} ] });
        }).not.toThrow();
    });

    it( "should by default construct at a 0, 0 coordinate", () => {
        const sprite = new Sprite({ width, height });

        expect( sprite.getX() ).toEqual( 0 );
        expect( sprite.getY() ).toEqual( 0 );
    });

    it( "should be able to toggle its draggable state", () => {
        const sprite = new Sprite({ width, height });

        expect( sprite.getDraggable() ).toBe( false );

        sprite.setDraggable( true );
        expect( sprite.getDraggable() ).toBe( true );
        expect( sprite.getInteractive() ).toBe( true );

        // @ts-expect-error protected propery
        expect( sprite._keepInBounds ).toBe( false );

        sprite.setDraggable( false );
        expect( sprite.getDraggable() ).toBe( false );

        sprite.setDraggable( true, true );
        // @ts-expect-error protected propery
        expect( sprite._keepInBounds ).toBe( true );
    });

    it( "should be able to toggle its interactive state", () => {
        const sprite = new Sprite({ width, height });
        expect( sprite.getInteractive() ).toBe( false );

        sprite.setInteractive( true );
        expect( sprite.getInteractive() ).toBe( true );

        sprite.setInteractive( false );
        expect( sprite.getInteractive() ).toBe( false );
    });

    it( "should be able to update its coordinates", () => {
        const sprite = new Sprite({ x, y, width, height });

        const newX = Math.round( Math.random() * 100 ) + 10;
        const newY = Math.round( Math.random() * 100 ) + 10;

        sprite.setX( newX );
        sprite.setY( newY );

        expect( sprite.getX() ).toEqual( newX );
        expect( sprite.getY() ).toEqual( newY );
    });

    it( "should be able to update its coordinates and its child coordinates recursively", () => {
        const sprite = new Sprite({ x, y, width, height });

        const child1X = Math.round( Math.random() * 100 ) + 10;
        const child1Y = Math.round( Math.random() * 100 ) + 10;
        const child2X = Math.round( Math.random() * 100 ) + 10;
        const child2Y = Math.round( Math.random() * 100 ) + 10;

        const child1  = new Sprite({
            x: child1X,
            y: child1Y,
            width, height
        });

        const child2 = new Sprite({
            x: child2X,
            y: child2Y,
            width, height
        });

        // add child1 onto parent, add child2 onto child1
        sprite.addChild( child1 );
        child1.addChild( child2 );

        const newX            = Math.round( Math.random() * 100 ) + 10;
        const newY            = Math.round( Math.random() * 100 ) + 10;
        const expectedChild1X = child1X + ( newX - sprite.getX() );
        const expectedChild1Y = child1Y + ( newY - sprite.getY() );
        const expectedChild2X = child2X + ( expectedChild1X - child1.getX() );
        const expectedChild2Y = child2Y + ( expectedChild1Y - child1.getY() );

        // update coordinates
        sprite.setX( newX );
        sprite.setY( newY );

        // evaluate child1 coordinates

        expect( child1.getX() ).toEqual( expectedChild1X );
        expect( child1.getY() ).toEqual( expectedChild1Y );
        expect( child2.getX() ).toEqual( expectedChild2X );
        expect( child2.getY() ).toEqual( expectedChild2Y );
    });

    it( "should have a bounds rectangle describing its offset and dimensions", () => {
        const sprite = new Sprite({ x, y, width, height });
        const bounds = sprite.getBounds();

        expect( bounds.left ).toEqual( x );
        expect( bounds.top ).toEqual( y );
        expect( bounds.width ).toEqual( width );
        expect( bounds.height ).toEqual( height );
    });

    it( "should invoke the update() method on its children recursively", () => {
        const expectedUpdates = 3;
        let updated = 0;

        // hijack update Function

        const orgUpdateFn = Sprite.prototype.update;
        vi.spyOn( Sprite.prototype, "update" ).mockImplementation( function() {
            ++updated;
            orgUpdateFn.call( this );
        });
        const sprite = new Sprite({ width, height });
        const child1 = new Sprite({ width, height });
        const child2 = new Sprite({ width, height });

        sprite.addChild( child1 );
        child1.addChild( child2 );

        // update

        sprite.update( 0, 1 );

        // evaluate

        expect( updated ).toEqual( expectedUpdates );
    });

    it( "should be able to determine whether a coordinate is inside the sprites bounding box", () => {
        const sprite = new Sprite({ x, y, width, height });

        // top left
        expect( sprite.insideBounds( x - 1, y - 1 )).toBe( false );
        expect( sprite.insideBounds( x, y )).toBe( true );
        // top right
        expect( sprite.insideBounds( x + width + 1, y )).toBe( false );
        expect( sprite.insideBounds( x + width, y )).toBe( true );
        // bottom right
        expect( sprite.insideBounds( x + width, y + height + 1 )).toBe( false );
        expect( sprite.insideBounds( x + width, y + height )).toBe( true );
        // bottom left
        expect( sprite.insideBounds( x - 1, y + height )).toBe( false );
        expect( sprite.insideBounds( x, y + height )).toBe( true );
        // center
        expect( sprite.insideBounds( x + width / 2, y + height / 2 )).toBe( true );
    });

    it( "should be able to determine when it collides with another sprite", () => {
        const sprite = new Sprite({ x, y, width, height });

        const withinX = x + ( width  / 2 );
        const withinY = y + ( height / 2 );
        const outX    = x - width + 1;
        const outY    = y + height + 1;

        const spriteInBounds = new Sprite({
            x: withinX,
            y: withinY,
            width, height
        });

        const spriteOutOfBounds = new Sprite({
            x: outX,
            y: outY,
            width, height
        });

        expect( sprite.collidesWith( spriteInBounds )).toBe( true );
        expect( sprite.collidesWith( spriteOutOfBounds )).toBe( false );
    });

    it( "should be able to determine whether it collides with the edge of another sprite", () => {
        const sprite = new Sprite({ x, y, width, height });

        // expected sprite not collide with itself
        expect( sprite.collidesWithEdge( sprite, 0 )).toBe( false );

        const sprite2 = new Sprite({ x, y, width, height });
        canvas.addChild( sprite2 );

        expect(() => {
            sprite.collidesWithEdge( sprite2, 5 );
        }).toThrow( /invalid argument for edge/ );

        // test left collision

        sprite2.setX( x + 1 );
        expect( sprite.collidesWithEdge( sprite2, 0 )).toBe( true );

        // test right collision

        sprite2.setX( x + width );
        expect( sprite.collidesWithEdge( sprite2, 2 )).toBe( true );

        // test top collision

        sprite2.setX( x );
        sprite2.setY( y + 1 );
        expect( sprite.collidesWithEdge( sprite2, 1 )).toBe( true );

        // test bottom collision

        sprite2.setY( y + height );
        expect( sprite.collidesWithEdge( sprite2, 3 )).toBe( true );
    });

    it( "should be able to set a parent Sprite", () => {
        const sprite = new Sprite({ x, y, width, height });
        const child = new Sprite({ x, y, width, height });

        expect( child.getParent() ).toBeUndefined();

        sprite.addChild( child );
        expect( child.getParent() ).toEqual( sprite );

        sprite.removeChild( child );
        expect( child.getParent() ).toBeUndefined();
    });

    it( "should be able to set the Canvas onto itself and inner children", () => {
        const sprite = new Sprite({ x, y, width, height });
        const child = new Sprite({ x, y, width, height });

        sprite.addChild( child );

        expect( sprite.canvas ).toBeUndefined();
        expect( child.canvas ).toBeUndefined();

        const canvas = new Canvas({ width, height });
        sprite.setCanvas( canvas );

        expect( sprite.canvas ).toEqual( canvas );
        expect( child.canvas ).toEqual( canvas );
    });

    // it doesn't, question is... SHOULD it?
    it.skip( "should by default set its constraints to the Canvas bounds", () => {
        const sprite = new Sprite({ x, y, width, height });
        canvas.addChild( sprite );

        const constraint = sprite.getConstraint();

        expect( constraint.left ).toEqual( 0 );
        expect( constraint.top ).toEqual( 0 );
        expect( constraint.width ).toEqual( canvas.getWidth() );
        expect( constraint.height ).toEqual( canvas.getHeight() );
    });

    it( "should be able to define parent constraints", () => {
        const sprite = new Sprite({ x, y, width, height });

        const cX      = x - width;
        const cY      = y + height;
        const cWidth  = Math.round( width / 2 );
        const cHeight = Math.round( height / 2 );

        // @ts-expect-error protected propery
        expect( sprite._keepInBounds ).toBe( false );

        sprite.setConstraint( cX, cY, cWidth, cHeight );
        // @ts-expect-error protected propery
        expect( sprite._keepInBounds ).toBe( true );

        const constraint = sprite.getConstraint();

        expect( constraint.left ).toEqual( cX );
        expect( constraint.top  ).toEqual( cY );
        expect( constraint.width ).toEqual( cWidth );
        expect( constraint.height ).toEqual( cHeight );
    });

    it( "should add a reference to its parent Canvas when adding a child to its display list", () => {
        const canvas = new Canvas({ width, height });
        const sprite = new Sprite({ x, y, width, height });

        canvas.addChild( sprite );

        const child = new Sprite({ x, y, width, height });
        
        sprite.addChild( child );

        expect( child.canvas ).toEqual( canvas );
    });

    it( "should be able to update its resource", () => {
        const sprite = new Sprite({ x, y, width, height });

        sprite.setResource( resourceId );

        expect( sprite.getResourceId() ).toEqual( resourceId );

        sprite.setResource( null );
        expect( sprite.getResourceId() ).toBeNull();
    });

    it( "should by default keep its current size when updating resources", () => {
        const sprite = new Sprite({ x, y, width, height });

        sprite.setResource( resourceId );

        expect( sprite.getWidth() ).toEqual( width );
        expect( sprite.getHeight() ).toEqual( height );
    });

    it( "should be able to update its resource and size", () => {
        const sprite = new Sprite({ x, y, width, height });
        const newResourceId = "bar";

        const newWidth = 10, newHeight = 10;

        sprite.setResource( newResourceId, newWidth, newHeight );

        expect( sprite.getWidth() ).toEqual( newWidth );
        expect( sprite.getHeight() ).toEqual( newHeight );
    });

    it( "should be able to update its width", () => {
        const sprite = new Sprite({ x, y, width, height, resourceId });
        let newWidth = width;

        while ( width === newWidth ) {
            newWidth = Math.round( Math.random() * 1000 );
        }
        sprite.setWidth( newWidth );

        expect( sprite.getWidth() ).toEqual( newWidth );
    });

    it( "should be able to update its height", () => {
        const sprite = new Sprite({ x, y, width, height, resourceId });
        let newHeight = height;

        while ( height === newHeight ) {
            newHeight = Math.round( Math.random() * 1000 );
        }
        sprite.setHeight( newHeight );

        expect( sprite.getHeight() ).toEqual( newHeight );
    });

    it( "should render its Bitmap in tiles when a spritesheet is defined", () => {
        const sheet = [
            { row: 0, col: 0, amount: 5, fpt: 5 }
        ];
        const sprite = new Sprite({ width, height, sheet, resourceId });
        const aniProps = sprite._animation;
        const animation = sheet[ 0 ];

        expect( aniProps.col ).toEqual( animation.col );
        expect( aniProps.maxCol ).toEqual( animation.col + ( animation.amount - 1 ));
        expect( aniProps.fpt ).toEqual( animation.fpt );
        expect( aniProps.counter ).toEqual( 0 );

        for ( let i = 0; i < animation.fpt; ++i ) {
            sprite.update( Date.now() + i );

            if ( i < animation.fpt - 1 ) {
                 expect( aniProps.counter ).toEqual( i + 1 );
            } else {
                // expected counter to have reset after having met the max frames per tile
                expect( aniProps.counter ).toEqual( 0 );
            }
        }
        // expected column to have advanced after having met the max frames per tile
        expect( aniProps.col ).toEqual( 1 );

        aniProps.col = sheet.amount - 1;
        aniProps.counter = sheet.fpt - 1;

        sprite.update( Date.now() );

        // expected column to have jumped back to the first index after having played all tile frames
        //expect( aniProps.col ).toEqual( animation.col );
    });

    it( "should accept alternate dimensions for the spritesheet tiles", () => {
        const sheet = [
            { row: 0, col: 0, amount: 5, fpt: 5 }
        ];
        const tileWidth  = Math.round( Math.random() * 100 );
        const tileHeight = Math.round( Math.random() * 100 );
        const sprite = new Sprite({
            width, height, sheet, resourceId,
            sheetTileWidth: tileWidth, sheetTileHeight: tileHeight
        });
        expect( sprite._animation.tileWidth ).toEqual( tileWidth );
        expect( sprite._animation.tileHeight ).toEqual( tileHeight );
    });

    it( "should fire an animation callback if a sheet animation has completed", (): Promise<void> => {
        return new Promise( resolve => {
            const sheet = [
                { row: 0, col: 0, amount: 5, fpt: 5, onComplete: spriteRef => {
                    // expected animation complete handler to have returned reference to its calling Sprite
                    expect( spriteRef ).toEqual( sprite );
                    resolve();
                }}
            ];
            const sprite = new Sprite({ width, height, sheet, resourceId });
            const animation = sheet[ 0 ];

            for ( let i = 0; i < animation.amount; ++i ) {
                for ( let j = 0; j < animation.fpt; ++j ) {
                    sprite.update( Date.now() + i + j, 1 );
                }
            }
        });
    });

    describe( "when determining its visibility", () => {
        it( "should check against the provided Viewport", () => {
            const canvas = new Canvas({ viewport: { width, height }});
            const sprite = new Sprite({ width, height });

            mockMathFn.mockImplementation( fn => {
                if ( fn === "isInsideArea" ) {
                    return true;
                }
            });
            canvas.addChild( sprite );
            
            expect( sprite.isVisible( canvas.getViewport() )).toBe( true );
            expect( mockMathFn ).toHaveBeenCalledWith( "isInsideArea", sprite.getBounds(), canvas.getViewport() );
        });

        it( "should fall back to checking the Canvas' bounding box when no Viewport was provided", () => {
            const canvas = new Canvas();
            const sprite = new Sprite({ width, height });

            mockMathFn.mockImplementation( fn => {
                if ( fn === "isInsideArea" ) {
                    return true;
                }
            });
            canvas.addChild( sprite );

            expect( sprite.isVisible()).toBe( true );
            expect( mockMathFn ).toHaveBeenCalledWith( "isInsideArea", sprite.getBounds(), canvas.bbox );
        });
    });

    describe( "when handling events", () => {
        let mockEvent, sprite;
        beforeEach(() => {
            mockEvent = {
                type: "mousemove",
                changedTouches: [],
                offsetX: 10,
                offsetY: 10
            }
        });

        describe( "and the sprite is not interactive", () => {
            beforeEach(() => {
                mockEvent.type = "mousedown";
            });

            it( "should not handle anything", () => {
                const sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: false });
                const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                expect( handled ).toBe( false );
            });

            it( "except when it has interactive children", () => {
                const sprite = new Sprite({ x: 0, y: 0, width: 4, height: 4, interactive: false });
                sprite.addChild( new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true }));
                const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                expect( handled ).toBe( true );
            });
        });

        describe( "and the sprite is interactive", () => {
            it( "should set the hover state when moving over the sprite", () => {
                const sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                expect( sprite.hover ).toBe( false );
                const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                expect( sprite.hover ).toBe( true );
                expect( handled ).toBe( false ); // hovering does not stop event propagation
            });

            it( "should unset the hover state when moving out of a hovered sprite", () => {
                const sprite = new Sprite({ x: 15, y: 15, width: 10, height: 10, interactive: true });
                sprite.hover = true;
                const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                expect( sprite.hover ).toBe( false );
            });

            describe( "and pressing down on the sprite", () => {
                beforeEach(() => {
                    mockEvent.type = "mousedown";
                });

                it( "should call its handlePress handler", () => {
                    const sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                    vi.spyOn( sprite, "handlePress" );
                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( sprite.handlePress ).toHaveBeenCalledWith( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( handled ).toBe( true );
                });

                it( "should not allow dragging for non draggable sprites", () => {
                    const sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( sprite.isDragging ).toBe( false );
                    expect( handled ).toBe( true );
                });

                it( "should allow dragging for draggable sprites", () => {
                    const sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                    sprite.setDraggable( true );
                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( sprite.isDragging ).toBe( true );
                    expect( handled ).toBe( true );
                });
            });

            describe( "and moving over a down pressed sprite", () => {
                beforeEach(() => {
                    mockEvent.type = "mousemove";
                });

                it( "should not do anything for a non draggable sprite", () => {
                    const sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                    vi.spyOn( sprite, "handleMove" );
                    sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( sprite.handleMove ).not.toHaveBeenCalled();
                });

                it( "should call the move handler for a draggable sprite that is being dragged", () => {
                    const canvas = new Canvas({ width: 10, height: 10 });
                    const sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                    canvas.addChild( sprite );
                    vi.spyOn( sprite, "handleMove" );
                    sprite.setDraggable( true );
                    sprite.isDragging = true;
                    sprite._dragStartOffset = { x: sprite.getX(), y: sprite.getY() };
                    sprite._dragStartEventCoordinates = { x: mockEvent.offsetX, y: mockEvent.offsetY };
                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( sprite.handleMove ).toHaveBeenCalledWith( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( handled ).toBe( true );
                });
            });

            describe( "and releasing a down pressed sprite", () => {
                beforeEach(() => {
                    mockEvent.type = "mouseup";
                    // create sprite within mock event bounds and with down press state
                    sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                    sprite._pressed = true;

                    const canvas = new Canvas({ width: sprite.getWidth(), height: sprite.getHeight() });
                    canvas.addChild( sprite );
                });

                it( "should call its handleClick handler if the elapsed time between press and release was below 250 ms, along with handleRelease", () => {
                    sprite._pressTime = Date.now() - 249;

                    const clickSpy   = vi.spyOn( sprite, "handleClick" );
                    const releaseSpy = vi.spyOn( sprite, "handleRelease" );

                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );

                    expect( clickSpy ).toHaveBeenCalled();
                    expect( releaseSpy ).toHaveBeenCalled();
                    expect( handled ).toBe( true );
                });

                it( "should only call its handleRelease handler if the elapsed time between press and release was over 250 ms", () => {
                    sprite._pressTime = Date.now() - 250;
                    
                    const clickSpy   = vi.spyOn( sprite, "handleClick" );
                    const releaseSpy = vi.spyOn( sprite, "handleRelease" );

                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );

                    expect( clickSpy ).not.toHaveBeenCalled();
                    expect( releaseSpy ).toHaveBeenCalled();
                    expect( handled ).toBe( true );
                });

                it( "should unset the dragging state for draggable Sprites", () => {
                    // set draggable sprite variables
                    sprite._dragStartOffset = { x: sprite.getX(), y: sprite.getY() };
                    sprite._dragStartEventCoordinates = { x: mockEvent.offsetX, y: mockEvent.offsetY };

                    sprite.setDraggable( true );
                    sprite.isDragging = true;
                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( sprite.isDragging ).toBe( false );
                    expect( handled ).toBe( true );
                });
            });
        });
    });

    describe( "when rendering its contents", () => {
        const viewport = { left: 10, top: 10, width: 100, height: 50, right: 110, bottom: 60 };
        
        let mockRenderer: IRenderer;
        let sprite: Sprite;

        beforeEach(() => {
            mockRenderer = createMockRenderer();
            sprite = new Sprite({ x: 5, y: 5, width: 50, height: 50, resourceId });
            canvas.addChild( sprite );
        });

        it ( "should not draw when it has no resource associated with it", () => {
            sprite.setResource( null );
            sprite.draw( mockRenderer, viewport );
            expect( mockRenderer.drawImage ).not.toHaveBeenCalled();
        });

        it( "should draw when it has a resource", () => {
            sprite.draw( mockRenderer );
            vi.spyOn( sprite, "isVisible" ).mockImplementation(() => true );

            expect( mockRenderer.drawImage ).toHaveBeenCalledWith(
                resourceId,
                expect.any( Number ), expect.any( Number ), expect.any( Number ), expect.any( Number )
            );
        });

        describe( "and a viewport is passed", () => {
            it( "should perform a boundary check and not draw when the Sprite is outside of visible bounds", () => {
                const visibleSpy = vi.spyOn( sprite, "isVisible" ).mockImplementation(() => false );

                sprite.draw( mockRenderer, viewport );

                expect( visibleSpy ).toHaveBeenCalledWith( viewport );
                expect( mockRenderer.drawImage ).not.toHaveBeenCalled();
            });

            it( "should perform a boundary check and draw when the Sprite is inside visible bounds", () => {
                mockMathFn.mockImplementation( fn => {
                    if ( fn === "calculateDrawRectangle" ) {
                        return {
                            src: { left: 1, top: 2, width: 3, height: 4 },
                            dest: { let: 5, top: 6, width: 7, height: 8 }
                        };
                    }
                });

                const visibleSpy = vi.spyOn( sprite, "isVisible" ).mockImplementation(() => true );

                sprite.draw( mockRenderer, viewport );

                expect( visibleSpy ).toHaveBeenCalledWith( viewport );
                expect( mockMathFn ).toHaveBeenCalledWith( "calculateDrawRectangle", sprite.getBounds(), viewport );
                expect( mockRenderer.drawImageCropped ).toHaveBeenCalledWith(
                    sprite.getResourceId(),
                    expect.any( Number ), expect.any( Number ), expect.any( Number ), expect.any( Number ),
                    expect.any( Number ), expect.any( Number ), expect.any( Number ), expect.any( Number ),
                    // @ts-expect-error snooping on protected property
                    sprite._drawContext,
                );
            });
        });
    });
});
