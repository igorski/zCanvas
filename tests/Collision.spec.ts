import { describe, it, expect, beforeEach, vi } from "vitest";
import "vitest-canvas-mock";
import type { ImageSource } from "../src/definitions/types";
import Collision from "../src/Collision";
import Sprite from "../src/Sprite";
import RenderAPI from "../src/rendering/RenderAPI";
import { createMockImageBitmap } from "./__mocks";

describe( "Collision", () => {
    let collision: Collision;
    let renderer: RenderAPI;

    beforeEach(() => {
        renderer = new RenderAPI( document.createElement( "canvas" ));
        collision = new Collision( renderer );
        
        vi.spyOn( renderer, "loadResource" ).mockImplementation( function( id: string, source: ImageSource ): Promise<Size> {
            this._renderer.cacheResource( id, document.createElement( "canvas" ));
            return Promise.resolve({ width: 640, height: 320 })
        });
    });

    it( "should not be able to cache a collision mask for a non-registered resource", async () => {
        expect( await collision.cache( "fooBar" )).toBe( false );
    });

    it( "should be able to cache a collision mask for a registered resource", async () => {
        await renderer.loadResource( "fooBar", createMockImageBitmap() );

        expect( await collision.cache( "fooBar" )).toBe( true );
    });

    it( "should know whether a resource has a cached collision map", async () => {
        await renderer.loadResource( "fooBar", createMockImageBitmap() );

        expect( collision.hasCache( "fooBar" )).toBe( false );

        await collision.cache( "fooBar" );

        expect( await collision.cache( "fooBar" )).toBe( true );
    });

    it( "should be able to maintain a cache for multiple collision masks", async () => {
        await renderer.loadResource( "foo", createMockImageBitmap() );
        await renderer.loadResource( "bar", createMockImageBitmap() );

        expect( await collision.cache( "foo" )).toBe( true );
        expect( await collision.cache( "bar" )).toBe( true );

        expect( collision.hasCache( "foo" )).toBe( true );
        expect( collision.hasCache( "bar" )).toBe( true );
    });

    it( "should be able to remove cached collision masks from its Cache", async () => {
        await renderer.loadResource( "foo", createMockImageBitmap() );
        await renderer.loadResource( "bar", createMockImageBitmap() );

        expect( await collision.cache( "foo" )).toBe( true );
        expect( await collision.cache( "bar" )).toBe( true );

        expect( collision.clearCache( "foo" )).toBe( true );
        expect( collision.hasCache( "foo" )).toBe( false );
        expect( collision.hasCache( "bar" )).toBe( true );

        // expect to be false as foo is no longer in the cache
        expect( collision.clearCache( "foo" )).toBe( false );

        expect( collision.clearCache( "bar" )).toBe( true );
        expect( collision.hasCache( "bar" )).toBe( false );
    });

    it( "should be able to populate a provided pixel Array with numerical values from a localised rectangle within a cached collision mask", async () => {
        await renderer.loadResource( "foo", createMockImageBitmap() );
        await collision.cache( "foo" );

        const sprite = new Sprite({ width: 640, height: 320, resourceId: "foo" });
        const pixels = new Array();

        collision.getPixelArray( sprite, { top: 20, left: 10, width: 30, height: 15 }, pixels );

        expect( pixels.length ).toEqual( 30 * 15 );
        expect( pixels.every( value => typeof value === "number" )).toBe( true );
    });
});
