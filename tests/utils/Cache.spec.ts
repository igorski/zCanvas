import { describe, beforeEach, afterEach, it, expect, vi } from "vitest";
import Cache from "../../src/utils/Cache";
import { createMockImageBitmap } from "../__mocks";
 
describe( "Cache", () => {
    const createFn  = vi.fn(() => createMockImageBitmap ());
    const destroyFn = ( bitmap: ImageBitmap ) => bitmap.close();

    let cache: Cache<ImageBitmap>;

    beforeEach(() => {
        cache = new Cache( createFn, destroyFn );
    });

    afterEach(() => {
        vi.restoreAllMocks();
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

    it( "should be able to retrieve a Cached entry via its identifier", () => {
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

    it( "should pass the entry to the dispose method when removing it from the Cache", () => {
        const bitmap   = createMockImageBitmap();
        const clearSpy = vi.spyOn( bitmap, "close" );

        cache.set( "foo", bitmap );

        expect( clearSpy ).not.toHaveBeenCalled();

        cache.remove( "foo" );

        expect( clearSpy ).toHaveBeenCalled();
    });

    it( "should pass all invividual entries to the dispose method when disposing the Cache", () => {
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

    it( "should pass the previously registered entry to the dispose method when registering a new entry with a previously used id", () => {
        const bitmap1 = createMockImageBitmap();
        const bitmap2 = createMockImageBitmap();

        const clearSpy = vi.spyOn( bitmap1, "close" );

        cache.set( "foo", bitmap1 );
        cache.set( "foo", bitmap2 );

        expect( cache.has( "foo" )).toBe( true );
        expect( clearSpy ).toHaveBeenCalled();

        expect( cache.get( "foo" )).toEqual( bitmap2 );
    });

    describe( "when using the Cache as a Pool", () => {
        it( "should invoke the provided create function when requesting an entity while the Pool is empty", () => {
            const MOCK_OBJECT = { width: 100, height: 50 } as unknown as ImageBitmap;
            createFn.mockImplementation(() => MOCK_OBJECT );
            
            expect( createFn ).not.toHaveBeenCalled();

            const bitmap = cache.next();
            
            expect( createFn ).toHaveBeenCalled(); // assert constructor was called

            expect( bitmap ).toEqual( MOCK_OBJECT );
        });

        it( "should be able to fill the Pool with an arbitrary number of entities using the provided create function", () => {
            cache.fill( 3 );

            expect( cache.has( "0" )).toBe( true );
            expect( cache.has( "1" )).toBe( true );
            expect( cache.has( "2" )).toBe( true );

            expect( cache.has( "3" )).toBe( false );
        });

        it( "should be able to retrieve each precached entity from the Pool sequentially through repeated calls to next()", () => {
            cache.fill( 3 );

            expect( createFn ).toHaveBeenCalled();
            createFn.mockReset();

            expect( cache.get( "0" )).toEqual( cache.next() );
            expect( cache.get( "1" )).toEqual( cache.next() );
            expect( cache.get( "2" )).toEqual( cache.next() );

            expect( createFn ).not.toHaveBeenCalled(); // assert no new entities were created
        });

        it( "should be able to lazily create a new entity when requesting a new entity after exhausting the Pool", () => {
            cache.fill( 3 );
            createFn.mockReset();

            cache.next();
            cache.next();
            cache.next();

            const newest = cache.next();

            expect( cache.get( "3" )).toEqual( newest );

            expect( createFn ).toHaveBeenCalled();
        });

        it( "should be able to reset the iterator and allow retrieving entities at the beginning of the Pool", () => {
            cache.fill( 3 );
            createFn.mockReset();

            cache.next();
            cache.next();

            cache.reset();
            
            const newest = cache.next();

            expect( cache.get( "0" )).toEqual( newest );

            expect( createFn ).not.toHaveBeenCalled();
        });
    });
});