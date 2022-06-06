import Loader from "../src/Loader.js";

describe( "zCanvas.loader", () => {

    /* setup */

    let img, imgSource;

    // executed before the tests start running

    beforeAll( () => {
        // prepare 1x1 red PNG as Bitmap Image source
        imgSource = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP4z8DwHwAFAAH/VscvDQAAAABJRU5ErkJggg==";
        Loader.onReady = jest.fn(() => new Promise( resolve => resolve() ));
    });

    afterAll(() => {
        jest.restoreMocks();
    });

    describe( "when loading images", () => {
        it( "should pass a new Image instance to the load callback if Image was undefined", async () => {
            const data = await Loader.loadImage( imgSource );

            expect( typeof data ).toEqual( "object" );
            // expected Loader to have create a new Image instance
            expect( imgSource ).toEqual( data.image.src );
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

        it( "should apply the crossOrigin attribute for remote images", async () => {
            const urls = [
                "http://www.foo.jpg", "https://www.bar.jpg"
            ];

            for ( const url of urls ) {
                const data = await Loader.loadImage( url );
                // expected crossOrigin attribute to be Anonymous for remote images
                expect( data.image.crossOrigin ).toEqual( "Anonymous" );
            }
        });

        it.skip( "should return the Image dimensions to the load callback", async () => {
            const { size } = await Loader.loadImage( imgSource );

            expect( typeof size ).toEqual( "object" );
            // expected Loader to have returned correct Image dimensions
            expect( size.width ).toEqual( 1 );
            expect( size.height ).toEqual( 1 );
        });
    });

    describe( "when verifying whether an HTMLImageElement is ready for use", () => {
        it( "should not consider an image with a complete attribute set to false as ready", () => {
            const image = { complete: false };
            expect( Loader.isReady( image )).toBe( false );
        });

        it( "should not consider an image without a positive naturalWidth as ready", () => {
            const image = { complete: true, naturalWidth: 0 };
            expect( Loader.isReady( image )).toBe( false );
        });

        it( "should consider an image with a positive naturalWidth as ready", () => {
            const image = { complete: true, naturalWidth: 1 };
            expect( Loader.isReady( image )).toBe( true );
        });
    });
});
