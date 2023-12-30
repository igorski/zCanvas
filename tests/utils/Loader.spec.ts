import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import "vitest-canvas-mock";
import Loader from "../../src/utils/Loader";

const mockReadFile = vi.fn();
vi.mock( "../../src/utils/FileUtil", () => ({
    readFile: vi.fn(( ...args ) => mockReadFile( ...args )),
}));

describe( "Loader", () => {

    /* setup */

    let imgSource;
    let width = 0;
    let height = 0;

    // executed before the tests start running

    beforeEach( () => {
        // prepare 1x1 red PNG as Bitmap Image source
        imgSource = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP4z8DwHwAFAAH/VscvDQAAAABJRU5ErkJggg==";
        vi.spyOn( Loader, "onReady" ).mockImplementation( () => Promise.resolve() );

        vi.spyOn( window.Image.prototype, "naturalWidth", "get" ).mockImplementation(() => width );
        vi.spyOn( window.Image.prototype, "naturalHeight", "get" ).mockImplementation(() => height );
        vi.spyOn( window.Image.prototype, "src", "get" ).mockImplementation( function() {
            return this._src;
        });
        vi.spyOn( window.Image.prototype, "src", "set" ).mockImplementation( function( value: string ) {
            this._src = value;
            this.dispatchEvent( new Event( "load" ));
        });

        window.URL.createObjectURL = vi.fn(() => "fooBar");
        window.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe( "when loading images", () => {
        describe( "and the provided source of the String type", () => {
            it( "should return a new Image instance pointing to the provided source", async () => {
                const data = await Loader.loadImage( imgSource );

                expect( typeof data ).toEqual( "object" );

                expect( data.size ).toEqual({ width: expect.any( Number ), height: expect.any( Number )});
                expect( data.image ).toBeInstanceOf( window.Image );

                expect( data.image.src ).toEqual( imgSource );
            });

            it( "should not apply the crossOrigin attribute for local images", async () => {
                const urls = [
                    "./foo.jpg", "blob:http%3A//localhost%3A8383/568233a1-8b13-48b3-84d5-cca045ae384f", imgSource
                ];

                for ( const url of urls ) {
                    const data = await Loader.loadImage( url );
                    // expected crossOrigin attribute to be undefined for local images
                    expect( data.image.crossOrigin ).toEqual( "" );
                }
            });

            it( "should apply the crossOrigin attribute to remote images", async () => {
                const urls = [
                    "http://www.foo.jpg", "https://www.bar.jpg"
                ];

                for ( const url of urls ) {
                    const data = await Loader.loadImage( url );
                    // expected crossOrigin attribute to be Anonymous for remote images
                    expect( data.image.crossOrigin ).toEqual( "Anonymous" );
                }
            });
        });
        
        describe( "and the provided source is of a binary type", () => {
            it( "should be able to load images from File handles", async () => {
                const input = new File([], "foo.jpeg");

                const BLOB_CONTENT = new Blob();
                mockReadFile.mockImplementationOnce(() => Promise.resolve( BLOB_CONTENT ));

                const { image } = await Loader.loadImage( input );

                expect( mockReadFile ).toHaveBeenCalledWith( input );
                expect( image ).toBeInstanceOf( window.Image );

                // assert no memory is leaking
                expect( window.URL.createObjectURL ).toHaveBeenCalledWith( BLOB_CONTENT );
                expect( window.URL.revokeObjectURL ).toHaveBeenCalled();
            });

            it( "should be able to load images from Blobs", async () => {
                const input = new Blob();

                const { image } = await Loader.loadImage( input );

                expect( image ).toBeInstanceOf( window.Image );

                // assert no memory is leaking
                expect( window.URL.createObjectURL ).toHaveBeenCalledWith( input );
                expect( window.URL.revokeObjectURL ).toHaveBeenCalled();
            });
        });

        it( "should return the parsed Image dimensions to the load callback", async () => {
            width  = 66;
            height = 44;

            const { size } = await Loader.loadImage( imgSource );

            // expected Loader to have returned correct Image dimensions
            expect( size.width ).toEqual( width );
            expect( size.height ).toEqual( height );
        });
    });

    describe( "when verifying whether an HTMLImageElement is ready for use", () => {
        it( "should not consider an image with a complete attribute set to false as ready", () => {
            const image = { complete: false } as unknown as HTMLImageElement;
            expect( Loader.isReady( image )).toBe( false );
        });

        it( "should not consider an image without a positive naturalWidth as ready", () => {
            const image = { complete: true, naturalWidth: 0 }  as unknown as HTMLImageElement;
            expect( Loader.isReady( image )).toBe( false );
        });

        it( "should consider an image with a positive naturalWidth as ready", () => {
            const image = { complete: true, naturalWidth: 1 } as unknown as HTMLImageElement;;
            expect( Loader.isReady( image )).toBe( true );
        });
    });
});
