import { cache, clearCache, hasCache } from "../src/Collision.js";

describe( "zCanvas.collision", () => {
    it( "should be able to maintain a cache for multiple Bitmaps", async () => {
        const bitmap1 = document.createElement( "canvas" );
        const bitmap2 = document.createElement( "canvas" );

        expect( hasCache( bitmap1 )).toBe( false );
        expect( hasCache( bitmap2 )).toBe( false );

        expect( await cache( bitmap1 )).toBe( true );
        expect( hasCache( bitmap1 )).toBe( true );

        expect( await cache( bitmap2 )).toBe( true );
        expect( hasCache( bitmap1 )).toBe( true );
        expect( hasCache( bitmap2 )).toBe( true );

        expect( clearCache( bitmap1 )).toBe( true );
        expect( hasCache( bitmap1 )).toBe( false );
        expect( hasCache( bitmap2 )).toBe( true );

        // expect to be false as bitmap1 is no longer in the cache
        expect( clearCache( bitmap1 )).toBe( false );

        expect( clearCache( bitmap2 )).toBe( true );
        expect( hasCache( bitmap2 )).toBe( false );
    });
});
