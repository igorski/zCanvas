import { describe, it, expect, beforeEach } from "vitest";
import Collision from "../src/Collision";

describe( "Collision", () => {
    let collision: Collision;

    beforeEach(() => {
        collision = new Collision();
    });

    it( "should be able to maintain a cache for multiple Bitmaps", async () => {
        const bitmap1 = document.createElement( "canvas" );
        const bitmap2 = document.createElement( "canvas" );

        expect( collision.hasCache( bitmap1 )).toBe( false );
        expect( collision.hasCache( bitmap2 )).toBe( false );

        expect( await collision.cache( bitmap1 )).toBe( true );
        expect( collision.hasCache( bitmap1 )).toBe( true );

        expect( await collision.cache( bitmap2 )).toBe( true );
        expect( collision.hasCache( bitmap1 )).toBe( true );
        expect( collision.hasCache( bitmap2 )).toBe( true );

        expect( collision.clearCache( bitmap1 )).toBe( true );
        expect( collision.hasCache( bitmap1 )).toBe( false );
        expect( collision.hasCache( bitmap2 )).toBe( true );

        // expect to be false as bitmap1 is no longer in the cache
        expect( collision.clearCache( bitmap1 )).toBe( false );

        expect( collision.clearCache( bitmap2 )).toBe( true );
        expect( collision.hasCache( bitmap2 )).toBe( false );
    });
});
