import { describe, beforeEach, it, expect, vi } from "vitest";
import Cache from "../../src/utils/Cache";
import { createMockImageBitmap } from "../__mocks";
 
describe( "Cache", () => {
    let cache: Cache<ImageBitmap>;

    beforeEach(() => {
        cache = new Cache();
    });

    it( "should be able to set an entry in the Cache via an identifier", () => {
        const bitmap = createMockImageBitmap();
        
        cache.set( "foo", bitmap );

        expect( cache.has( "foo" )).toBe( true );
    });

    it( "should be able to set multiple entries", () => {
        const bitmap1 = createMockImageBitmap();
        const bitmap2 = createMockImageBitmap();

        cache.set( "foo", bitmap1 );
        cache.set( "bar", bitmap2 );

        expect( cache.has( "foo" )).toBe( true );
        expect( cache.has( "bar" )).toBe( true );
    });

    it( "should be able to retrieve a Cached ImageBitmap via its identifier", () => {
        const bitmap = createMockImageBitmap();
        
        cache.set( "foo", bitmap );

        expect( cache.get( "foo" )).toEqual( bitmap );
    });

    it( "should return false when an delete request did not find an entry for the given identifier", () => {
        expect( cache.remove( "foo" )).toBe( false );
    });

    it( "should be able to remove a Cached entry via its identifier", () => {
        const bitmap = createMockImageBitmap();
        cache.set( "foo", bitmap );

        expect( cache.remove( "foo" )).toBe( true );
        expect( cache.has( "foo" )).toBe( false );
        expect( cache.get( "foo" )).toBeUndefined();
    });

    it( "should clear the ImageBitmap when removing it from the Cache list", () => {
        const bitmap = createMockImageBitmap();
        const clearSpy = vi.spyOn( bitmap, "close" );

        cache.set( "foo", bitmap );

        expect( clearSpy ).not.toHaveBeenCalled();

        cache.remove( "foo" );

        expect( clearSpy ).toHaveBeenCalled();
    });

    it( "should clear all invividual ImageBitmaps when disposing the Cache", () => {
        const bitmap1 = createMockImageBitmap();
        const bitmap2 = createMockImageBitmap();

        const clearSpy1 = vi.spyOn( bitmap1, "close" );
        const clearSpy2 = vi.spyOn( bitmap2, "close" );

        cache.set( "foo", bitmap1 );
        cache.set( "bar", bitmap2 );

        cache.dispose();

        expect( clearSpy1 ).toHaveBeenCalled();
        expect( clearSpy2 ).toHaveBeenCalled();
    });

    it( "should clear the previously registered ImageBitmap when registering a new value with a previously used id", () => {
        const bitmap1 = createMockImageBitmap();
        const bitmap2 = createMockImageBitmap();

        const clearSpy = vi.spyOn( bitmap1, "close" );

        cache.set( "foo", bitmap1 );
        cache.set( "foo", bitmap2 );

        expect( cache.has( "foo" )).toBe( true );
        expect( clearSpy ).toHaveBeenCalled();
    });
});