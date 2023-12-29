import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from "vitest";
import "vitest-canvas-mock";
import type { SpriteSheet } from "../src/definitions/types";
import Canvas from "../src/Canvas";
import Sprite from "../src/Sprite";
import type { IRenderer } from "../src/rendering/IRenderer";
import { createMockRenderer } from "./__mocks";

const mockMathFn = vi.fn();
vi.mock('../src/utils/ImageMath', async () => {
    const actual = await vi.importActual( "../src/utils/ImageMath" );
    return {
        ...actual,
        calculateDrawRectangle : ( ...args ) => mockMathFn?.( "calculateDrawRectangle", ...args ),
        isInsideArea           : ( ...args ) => mockMathFn?.( "isInsideArea", ...args ),
    }
});

describe( "Sprite", () => {

    /* setup */

    const resourceId = "foo";

    let canvas: Canvas;
    let x: number;
    let y: number;
    let width: number;
    let height: number;

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
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe( "constructor", () => {
        it( "should not construct without valid dimensions specified", () => {
            expect(() => {
                new Sprite({});
            }).toThrow( /cannot construct a Sprite without valid dimensions/ );

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

        it( "should by default construct at a 0, 0 coordinate", () => {
            const sprite = new Sprite({ width, height });

            expect( sprite.getX() ).toEqual( 0 );
            expect( sprite.getY() ).toEqual( 0 );
        });

        it( "should construct accepting definitions for coordinates and dimensions", () => {
            const sprite = new Sprite({ x, y, width, height });

            expect( sprite.getX() ).toEqual( x );
            expect( sprite.getY() ).toEqual( y );
            expect( sprite.getWidth() ).toEqual( width );
            expect( sprite.getHeight() ).toEqual( height );
        });

        it( "should have appropriate default values when optional properties are not provided", () => {
            const sprite = new Sprite({ width, height });

            expect( sprite.getX() ).toEqual( 0 );
            expect( sprite.getY() ).toEqual( 0 );
            expect( sprite.getRotation() ).toEqual( 0 );
            expect( sprite.getScale() ).toEqual( 1 );
            expect( sprite.getResourceId() ).toBeUndefined();
            expect( sprite.collidable ).toBe( false );
            expect( sprite.getInteractive() ).toBe( false );
            // @ts-expect-error snooping on protected property
            expect( sprite._mask ).toBe( false );
        });

        it( "should apply the optional properties appropriately", () => {
            const sprite = new Sprite({
                width, height,
                collidable: true,
                mask: true,
                interactive: true,
                resourceId: "foo",
                rotation: 12,
            });

            expect( sprite.getResourceId() ).toEqual( "foo" );
            expect( sprite.getRotation() ).toEqual( 12 );
            expect( sprite.collidable ).toBe( true );
            expect( sprite.getInteractive() ).toBe( true );
            // @ts-expect-error snooping on protected property
            expect( sprite._mask ).toBe( true );
        });

        it( "should not construct with a spritesheet when no resourceId was provided", () => {
            expect(() => {
                new Sprite({ width, height, sheet: [ {} ] });
            }).toThrow( /cannot use a spritesheet without a valid resource id/ );

            expect(() => {
                new Sprite({ width, height, resourceId, sheet: [ {} ] });
            }).not.toThrow();
        });

        it( "should by default not have a cached transformed bounds object when no transformations were provided", () => {
            const sprite = new Sprite({ width, height });

            // @ts-expect-error snooping on private property
            expect( sprite._tfb ).toBeUndefined();
        });
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
   
        sprite.setInteractive( true );
        expect( sprite.getInteractive() ).toBe( true );

        sprite.setInteractive( false );
        expect( sprite.getInteractive() ).toBe( false );
    });

    describe( "when updating the X position", () => {
        it( "should be able to update its position", () => {
            const sprite = new Sprite({ x, y, width, height });

            const newX = x + 10;

            sprite.setX( newX );

            expect( sprite.getX() ).toEqual( newX );
        });

        it( "should be able to update its child coordinates recursively", () => {
            const sprite = new Sprite({ x, y, width, height });

            const child1x = x + 10;
            const child2x = x + 20;

            const child1 = new Sprite({ x: child1x, width, height });
            const child2 = new Sprite({ x: child2x, width, height });

            // add child1 onto parent, add child2 onto child1
            sprite.addChild( child1 );
            child1.addChild( child2 );

            const newX            = x + 30;
            const expectedChild1X = child1x + ( newX - sprite.getX() );
            const expectedChild2X = child2x + ( expectedChild1X - child1.getX() );

            // update coordinate
            sprite.setX( newX );

            // evaluate child1 coordinates

            expect( child1.getX() ).toEqual( expectedChild1X );
            expect( child2.getX() ).toEqual( expectedChild2X );
        });

        it( "should be able to update the offset of the optionally existing transformed bounds object", () => {
            const sprite = new Sprite({ x, y, width, height, rotation: 90 });

            // @ts-expect-error snooping on private property
            const existingTransformedLeft = sprite._tfb.left;

            sprite.setX( x + 10 );

            // @ts-expect-error snooping on private property
            expect( sprite._tfb.left ).toEqual( existingTransformedLeft + 10 );
        });

        it( "should invalidate the Canvas when setting a new X position", () => {
            const sprite = new Sprite({ width, height });

            const invalidateSpy = vi.spyOn( sprite, "invalidate" );

            sprite.setX( sprite.getX() + 10 );

            expect( invalidateSpy ).toHaveBeenCalled();
        });

        it( "should not do anything when the position hasn't changed", () => {
            const sprite = new Sprite({ width, height });

            const invalidateSpy = vi.spyOn( sprite, "invalidate" );

            sprite.setX( sprite.getX() );

            expect( invalidateSpy ).not.toHaveBeenCalled();
        });
    });

    describe( "when updating the Y position", () => {
        it( "should be able to update its position", () => {
            const sprite = new Sprite({ x, y, width, height });

            const newY = y + 10;

            sprite.setY( newY );

            expect( sprite.getY() ).toEqual( newY );
        });

        it( "should be able to update its child coordinates recursively", () => {
            const sprite = new Sprite({ x, y, width, height });

            const child1y = y + 10;
            const child2y = y + 20;

            const child1 = new Sprite({ y: child1y, width, height });
            const child2 = new Sprite({ y: child2y, width, height });

            // add child1 onto parent, add child2 onto child1
            sprite.addChild( child1 );
            child1.addChild( child2 );

            const newY            = y + 30;
            const expectedChild1y = child1y + ( newY - sprite.getY() );
            const expectedChild2y = child2y + ( expectedChild1y - child1.getY() );

            // update coordinate
            sprite.setY( newY );

            // evaluate child1 coordinates

            expect( child1.getY() ).toEqual( expectedChild1y );
            expect( child2.getY() ).toEqual( expectedChild2y );
        });

        it( "should be able to update the offset of the optionally existing transformed bounds object", () => {
            const sprite = new Sprite({ x, y, width, height, rotation: 90 });

            // @ts-expect-error snooping on private property
            const existingTransformdTop = sprite._tfb.top;

            sprite.setY( y - 10 );

            // @ts-expect-error snooping on private property
            expect( sprite._tfb.top ).toEqual( existingTransformdTop - 10 );
        });

        it( "should invalidate the Canvas when setting a new Y position", () => {
            const sprite = new Sprite({ width, height });

            const invalidateSpy = vi.spyOn( sprite, "invalidate" );

            sprite.setY( sprite.getY() + 10 );

            expect( invalidateSpy ).toHaveBeenCalled();
        });

        it( "should not do anything when the position hasn't changed", () => {
            const sprite = new Sprite({ width, height });

            const invalidateSpy = vi.spyOn( sprite, "invalidate" );

            sprite.setY( sprite.getY() );

            expect( invalidateSpy ).not.toHaveBeenCalled();
        });
    });

    describe( "when updating its width", () => {
        it( "should be able to update its width", () => {
            const sprite = new Sprite({ x, y, width, height, resourceId });
            const newWidth = width + 10;

            sprite.setWidth( newWidth );

            expect( sprite.getWidth() ).toEqual( newWidth );
        });

        it( "should invalidate the Canvas when setting a new width", () => {
            const sprite = new Sprite({ x, y, width, height, resourceId });
            const invalidateSpy = vi.spyOn( sprite, "invalidate" );

            const newWidth = width + 10;

            sprite.setWidth( newWidth );

            expect( invalidateSpy ).toHaveBeenCalled();
        });

        it( "should not do anything when the width hasn't changed", () => {
            const sprite = new Sprite({ x, y, width, height, resourceId });
            const invalidateSpy = vi.spyOn( sprite, "invalidate" );

            sprite.setWidth( width );

            expect( invalidateSpy ).not.toHaveBeenCalled();
        });
    });

    describe( "when updating its height", () => {
        it( "should be able to update its height", () => {
            const sprite = new Sprite({ x, y, width, height, resourceId });
            const newHeight = height + 10;

            sprite.setHeight( newHeight );

            expect( sprite.getHeight() ).toEqual( newHeight );
        });

        it( "should invalidate the Canvas when setting a new height", () => {
            const sprite = new Sprite({ x, y, width, height, resourceId });
            const invalidateSpy = vi.spyOn( sprite, "invalidate" );

            const newHeight = height + 10;

            sprite.setHeight( newHeight );

            expect( invalidateSpy ).toHaveBeenCalled();
        });

        it( "should not do anything when the height hasn't changed", () => {
            const sprite = new Sprite({ x, y, width, height, resourceId });
            const invalidateSpy = vi.spyOn( sprite, "invalidate" );

            sprite.setHeight( height );

            expect( invalidateSpy ).not.toHaveBeenCalled();
        });
    });

    describe( "when getting the Sprite bounds", () => {
        beforeEach(() => {
            x = 10;
            y = 20;
            width = 40;
            height = 30;
        });

        it( "should return the bounds rectangle describing its offset and dimensions", () => {
            const sprite = new Sprite({ x, y, width, height });
            const bounds = sprite.getBounds();
    
            expect( bounds.left ).toEqual( x );
            expect( bounds.top ).toEqual( y );
            expect( bounds.width ).toEqual( width );
            expect( bounds.height ).toEqual( height );
        });

        it( "should return the transformed rectangle when requesting the transformed bounds (and transformations are set)", () => {
            const sprite = new Sprite({ x, y, width, height, rotation: 90 });

            const bounds = sprite.getBounds( true );
    
            // note we rotated sideways
            expect( Math.round( bounds.left )).toEqual( 15 );
            expect( Math.round( bounds.top )).toEqual( 15 );
            expect( Math.round( bounds.width )).toEqual( 30 );
            expect( Math.round( bounds.height )).toEqual( 40 );
        });

        it( "should return the untransformed rectangle when requesting the transformed bounds (and no transformations are set)", () => {
            const sprite = new Sprite({ x, y, width, height });
            
            const bounds = sprite.getBounds( true );
    
            expect( bounds.left ).toEqual( x );
            expect( bounds.top ).toEqual( y );
            expect( bounds.width ).toEqual( width );
            expect( bounds.height ).toEqual( height );
        });
    });

    describe( "when managing its rotation", () => {
        it( "should by default return a neutral rotation when none has been provided yet", () => {
            const sprite = new Sprite({ width, height });

            expect( sprite.getRotation()).toEqual( 0 );
        });

        it( "should be able to get and set its rotation", () => {
            const sprite = new Sprite({ width, height });
    
            sprite.setRotation( 12 );
    
            expect( sprite.getRotation() ).toEqual( 12 );
        });

        it( "should invalidate the DrawProps cache", () => {
            const sprite = new Sprite({ width, height });

            // @ts-expect-error snooping on protected property
            const invalidateSpy = vi.spyOn( sprite, "invalidateDrawProps" );

            sprite.setRotation( 12 );

            expect( invalidateSpy ).toHaveBeenCalledWith({ rotation: 12 });
        });

        it( "should set the optional pivot point onto the DrawProps", () => {
            const sprite = new Sprite({ width, height });

            // @ts-expect-error snooping on protected property
            const invalidateSpy = vi.spyOn( sprite, "invalidateDrawProps" );

            sprite.setRotation( 12, { x: 7, y: 8 });

            expect( invalidateSpy ).toHaveBeenCalledWith({ rotation: 12, pivot: { x: 7, y: 8 } });
        });

        it( "should return the appropriate value using the getter, when the drawProps value changes from the outside", () => {
            const sprite = new Sprite({ width, height });

            sprite.setRotation( 12, { x: 7, y: 8 });
            sprite.getTransforms().rotation = 14;

            // @ts-expect-error snooping on protected property
            sprite.getDrawProps(); // calling internal getter synchronises values

            expect( sprite.getRotation()).toEqual( 14 );
        });
    });

    describe( "when managing its scale", () => {
        it( "should by default return a neutral scale when none has been provided yet", () => {
            const sprite = new Sprite({ width, height });

            expect( sprite.getScale()).toEqual( 1 );
        });

        it( "should be able to get and set its scale", () => {
            const sprite = new Sprite({ width, height });
    
            sprite.setScale( 7 );
    
            expect( sprite.getScale() ).toEqual( 7 );
        });

        it( "should invalidate the cached DrawProps", () => {
            const sprite = new Sprite({ width, height });

            // @ts-expect-error snooping on protected property
            const invalidateSpy = vi.spyOn( sprite, "invalidateDrawProps" );

            sprite.setScale( 7 );

            expect( invalidateSpy ).toHaveBeenCalledWith({ scale: 7 });
        });

        it( "should return the appropriate value using the getter, when the drawProps value changes from the outside", () => {
            const sprite = new Sprite({ width, height });

            sprite.setScale( 8 );
            sprite.getTransforms().scale = 7;

            // @ts-expect-error snooping on protected property
            sprite.getDrawProps(); // calling internal getter synchronises values

            expect( sprite.getScale()).toEqual( 7 );
        });
    });

    describe( "when managing multiple properties through the Transforms getter", () => {
        it( "should lazily create the DrawProps object when there is none", () => {
            const sprite = new Sprite({ width, height });
            
            expect( sprite.getTransforms() ).toEqual({
                rotation: 0,
                scale: 1,
                alpha: 1,
            });

            // @ts-expect-error snooping on private property
            expect( sprite._dp ).not.toBeUndefined();
        });

        it( "should take the values from the existing DrawProps object", () => {
            const sprite = new Sprite({ width, height, rotation: 45 });

            sprite.setScale( 2 );
            
            expect( sprite.getTransforms() ).toEqual({
                rotation: 45,
                scale: 2,
                alpha: 1,
            });
        });
    });

    describe( "when managing its DrawProps cache for transformations and blending effects", () => {
        it( "should by default not construct with a DrawProps instance", () => {
            const sprite = new Sprite({ width, height });

            // @ts-expect-error snooping on private property
            expect( sprite._dp ).toBeUndefined();
        });

        it( "should cache a DrawProps instance when a transformation was provided to the constructor", () => {
            const sprite = new Sprite({ width, height, rotation: 12 });

            // @ts-expect-error snooping on private property
            expect( sprite._dp ).toEqual({
                alpha: 1,
                scale: 1,
                rotation: 12,
                pivot: undefined,
                blendMode: undefined,
                safeMode: false,
            });
        });

        it( "should cache a DrawProps object when masking was requested in the constructor", () => {
            const sprite = new Sprite({ width, height, mask: true });

            // @ts-expect-error snooping on private property
            expect( sprite._dp ).toEqual({
                alpha: 1,
                scale: 1,
                rotation: 0,
                pivot: undefined,
                blendMode: "destination-in",
                safeMode: false,
            });
        });

        it( "should allow internal access to the current DrawProps state via the protected getter", () => {
            const sprite = new Sprite({ width, height, rotation: 12 });

            // @ts-expect-error snooping on protected property
            expect( sprite.getDrawProps()).toEqual( sprite._dp );
        });

        it( "should synchronise the values with the optionally existing setTransforms instance", () => {
            const sprite = new Sprite({ width, height, rotation: 12 });

            const transform = sprite.getTransforms();

            transform.rotation = 33;
            transform.scale = 2.5;
            transform.alpha = 0.24;

            // @ts-expect-error snooping on private property
            const invalidateSpy = vi.spyOn( sprite, "invalidateDrawProps" );

            // @ts-expect-error snooping on protected property
            sprite.getDrawProps();

            expect( invalidateSpy ).toHaveBeenCalledWith({ rotation: 33, scale: 2.5, alpha: 0.24 });
        });

        it( "should not synchronise the values with the optionally existing setTransforms instance when they have not changed", () => {
            const sprite = new Sprite({ width, height, rotation: 12 });
            sprite.setScale( 2.5 );

            const transform = sprite.getTransforms();

            transform.rotation = 12;
            transform.scale    = 2.5;

            // @ts-expect-error snooping on private property
            const invalidateSpy = vi.spyOn( sprite, "invalidateDrawProps" );

            // @ts-expect-error snooping on protected property
            sprite.getDrawProps();

            expect( invalidateSpy ).not.toHaveBeenCalled();
        });

        describe( "and invalidating the DrawProps cache", () => {
            it( "should lazily create a DrawProps cache object when non existed", () => {
                const sprite = new Sprite({ width, height });

                // @ts-expect-error snooping on protected property
                sprite.invalidateDrawProps({});

                // @ts-expect-error snooping on private property
                expect( sprite._dp ).not.toBeUndefined();
            });

            it( "should keep the existing values when no properties were passed in the arguments", () => {
                const sprite = new Sprite({ width, height, rotation: 12 });
                sprite.setScale( 7 );

                // @ts-expect-error snooping on protected property
                sprite.invalidateDrawProps({});

                // @ts-expect-error snooping on private property
                expect( sprite._dp ).toEqual({
                    scale: 7,
                    rotation: 12,
                    alpha: 1,
                    safeMode: false,
                });
            });

            it( "should update the existing values with the provided properties", () => {
                const sprite = new Sprite({ width, height, rotation: 12 });
                sprite.setScale( 7 );

                // @ts-expect-error snooping on protected property
                sprite.invalidateDrawProps({ rotation: 33, pivot: { x: 12, y: 20 }, alpha: 0.5, scale: 2.5 });

                // @ts-expect-error snooping on private property
                expect( sprite._dp ).toEqual({
                    scale: 2.5,
                    rotation: 33,
                    pivot: { x: 12, y: 20 },
                    alpha: 0.5,
                    safeMode: false,
                });
            });

            it( "should not cache a transformed bounds object when no transformations were provided", () => {
                const sprite = new Sprite({ width, height });

                // @ts-expect-error snooping on protected property
                sprite.invalidateDrawProps({ alpha: 0.5 });

                // @ts-expect-error snooping on private property
                expect( sprite._tfb ).toBeUndefined();
            });

            it( "should cache a transformed bounds object when a scale transformation was provided", () => {
                const sprite = new Sprite({ width, height });

                // @ts-expect-error snooping on protected property
                sprite.invalidateDrawProps({ scale: 1.5 });

                // @ts-expect-error snooping on private property
                expect( sprite._tfb ).not.toBeUndefined();
            });

            it( "should cache a transformed bounds object when a rotation transformation was provided", () => {
                const sprite = new Sprite({ width, height });

                // @ts-expect-error snooping on protected property
                sprite.invalidateDrawProps({ rotation: 33 });

                // @ts-expect-error snooping on private property
                expect( sprite._tfb ).not.toBeUndefined();
            });
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

        it( "should check against the transformed bounds when the DrawProps cache contains transformation values", () => {
            const canvas = new Canvas();
            const sprite = new Sprite({ width, height, rotation: 10 });

            canvas.addChild( sprite );

            sprite.isVisible();

            // @ts-expect-error snooping on protected property
            expect( mockMathFn ).toHaveBeenCalledWith( "isInsideArea", sprite._tfb, canvas.bbox );
        });
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

    describe( "when managing its resourceId", () => {
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

    it( "should be able to set the Canvas onto itself and children", () => {
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

    it( "should accept alternative dimensions for the spritesheet tiles", () => {
        const sheet = [
            { row: 0, col: 0, amount: 5, fpt: 5 }
        ];
        const tileWidth  = Math.round( Math.random() * 100 );
        const tileHeight = Math.round( Math.random() * 100 );
        const sprite = new Sprite({
            width, height, sheet, resourceId,
            sheetTileWidth: tileWidth, sheetTileHeight: tileHeight
        });
        // @ts-expect-error snooping on protected property
        const animation = sprite._animation!;

        expect( animation.tileWidth ).toEqual( tileWidth );
        expect( animation.tileHeight ).toEqual( tileHeight );
    });

    describe( "when updating the Sprite prior to rendering", () => {
        it( "should invoke the update() method on its children recursively", () => {
            const sprite = new Sprite({ width, height });
            const child1 = new Sprite({ width, height });
            const child2 = new Sprite({ width, height });

            sprite.addChild( child1 );
            child1.addChild( child2 );

            const child1updateSpy = vi.spyOn( child1, "update" );
            const child2updateSpy = vi.spyOn( child2, "update" );

            // update

            const now = window.performance.now();
            const elapsedFrames = 1.5;

            sprite.update( now, elapsedFrames );

            // evaluate

            expect( child1updateSpy ).toHaveBeenCalledWith( now, elapsedFrames );
            expect( child2updateSpy ).toHaveBeenCalledWith( now, elapsedFrames );
        });

        describe( "and the Sprite has a spritesheet animation", () => {
            it( "should render its Bitmap in tiles", () => {
                const sheet = [
                    { row: 0, col: 0, amount: 5, fpt: 5 }
                ] as SpriteSheet[];
                const sprite = new Sprite({ width, height, sheet, resourceId });
        
                // @ts-expect-error snooping on protected property
                const aniProps = sprite._animation!;
                const animation = sheet[ 0 ];
        
                expect( aniProps.col ).toEqual( animation.col );
                expect( aniProps.maxCol ).toEqual( animation.col + ( animation.amount - 1 ));
                expect( aniProps.fpt ).toEqual( animation.fpt );
                expect( aniProps.counter ).toEqual( 0 );
        
                for ( let i = 0; i < animation.fpt; ++i ) {
                    sprite.update( window.performance.now() + i, 1 );
        
                    if ( i < animation.fpt - 1 ) {
                         expect( aniProps.counter ).toEqual( i + 1 );
                    } else {
                        // expected counter to have reset after having met the max frames per tile
                        expect( aniProps.counter ).toEqual( 0 );
                    }
                }
                // expected column to have advanced after having met the max frames per tile
                expect( aniProps.col ).toEqual( 1 );
        
                aniProps.col     = animation.amount - 1;
                aniProps.counter = animation.fpt - 1;
        
                sprite.update( window.performance.now(), 1 );
        
                // expected column to have jumped back to the first index after having played all tile frames
                expect( aniProps.col ).toEqual( animation.col );
            });
        
            it( "should fire an animation callback when a sheet animation has completed", (): Promise<void> => {
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
                            sprite.update( window.performance.now() + i + j, 1 );
                        }
                    }
                });
            });

            it( "should advance the animation by the elapsed frames", () => {
                const sheet = [
                    { row: 0, col: 0, amount: 5, fpt: 5 }
                ];
                const sprite = new Sprite({ width, height, sheet, resourceId })

                // @ts-expect-errors nooping on protected property
                const updateAnimationSpy = vi.spyOn( sprite, "updateAnimation" );

                sprite.update( window.performance.now(), 1.65 );

                expect( updateAnimationSpy ).toHaveBeenCalledWith( 1.65 );
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
            vi.spyOn( sprite, "isVisible" ).mockImplementation(() => true );
            sprite.draw( mockRenderer );
            
            expect( mockRenderer.drawImage ).toHaveBeenCalledWith(
                resourceId,
                expect.any( Number ), expect.any( Number ), expect.any( Number ), expect.any( Number ), undefined
            );
        });

        describe( "and a viewport is provided", () => {
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
                            src : { left: 1, top: 2, width: 3, height: 4 },
                            dest: { left: 5, top: 6, width: 7, height: 8 }
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
                    // @ts-expect-error snooping on private property
                    sprite._dp,
                );
            });
        });
    });

    describe( "when handling interaction events", () => {
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
                    
                    // @ts-expect-error snooping on protected property
                    const pressSpy = vi.spyOn( sprite, "handlePress" );
                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );

                    expect( pressSpy ).toHaveBeenCalledWith( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
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
                    // @ts-expect-error snooping on protected property
                    const moveSpy = vi.spyOn( sprite, "handleMove" );

                    sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( moveSpy ).not.toHaveBeenCalled();
                });

                it( "should call the move handler for a draggable sprite that is being dragged", () => {
                    const canvas = new Canvas({ width: 10, height: 10 });
                    const sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                    canvas.addChild( sprite );

                    // @ts-expect-error snooping on protected property
                    const moveSpy = vi.spyOn( sprite, "handleMove" );

                    sprite.setDraggable( true );
                    sprite.isDragging = true;

                    // @ts-expect-error snooping on protected property
                    sprite._dro = { x: sprite.getX(), y: sprite.getY() };
                    // @ts-expect-error snooping on protected property
                    sprite._drc = { x: mockEvent.offsetX, y: mockEvent.offsetY };
                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    
                    expect( moveSpy ).toHaveBeenCalledWith( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
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
                    sprite._pTime = window.performance.now() - 249;

                    const clickSpy   = vi.spyOn( sprite, "handleClick" );
                    const releaseSpy = vi.spyOn( sprite, "handleRelease" );

                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );

                    expect( clickSpy ).toHaveBeenCalled();
                    expect( releaseSpy ).toHaveBeenCalled();
                    expect( handled ).toBe( true );
                });

                it( "should only call its handleRelease handler if the elapsed time between press and release was over 250 ms", () => {
                    sprite._pTime = window.performance.now() - 250;
                    
                    const clickSpy   = vi.spyOn( sprite, "handleClick" );
                    const releaseSpy = vi.spyOn( sprite, "handleRelease" );

                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );

                    expect( clickSpy ).not.toHaveBeenCalled();
                    expect( releaseSpy ).toHaveBeenCalled();
                    expect( handled ).toBe( true );
                });

                it( "should unset the dragging state for draggable Sprites", () => {
                    sprite.setDraggable( true );
                    sprite.isDragging = true;
                   
                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                   
                    expect( sprite.isDragging ).toBe( false );
                    expect( handled ).toBe( true );
                });
            });
        });
    });

    it( "should call the invalidate() handler of the parent Canvas when invalidate() is called", () => {
        const sprite = new Sprite({ width, height });
        canvas.addChild( sprite );

        const invalidateSpy = vi.spyOn( canvas, "invalidate" );

        sprite.invalidate();

        expect( invalidateSpy ).toHaveBeenCalled();
    });
});
