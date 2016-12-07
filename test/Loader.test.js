"use strict";

const chai          = require( "chai" );
const MockedBrowser = require( "./utils/MockedBrowser" );
const Loader        = require( "../src/Loader" );

describe( "zCanvas.loader", () => {

    /* setup */

    // use Chai assertion library
    const assert = chai.assert,
          expect = chai.expect;

    let img, imgSource;

    // executed before the tests start running

    before( () => {

        // prepare mock browser
        MockedBrowser.init();

        // prepare 1x1 red PNG as Bitmap Image source
        imgSource = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP4z8DwHwAFAAH/VscvDQAAAABJRU5ErkJggg==";
    });

    // executed when all tests have finished running

    after( () => {

    });

    // executed before each individual test

    beforeEach( () => {

    });

    // executed after each individual test

    afterEach( () => {

    });

    /* actual unit tests */

    it( "should pass a new Image instance to the load callback if Image was undefined", ( done ) => {

        Loader.loadImage( imgSource, ( data ) => {

            assert.ok( typeof data === "object", "expected data Object to have returned" );
            assert.strictEqual( imgSource, data.image.src,
                "expected Loader to have create a new Image instance" );

            done();
        });
    });

    it( "should not apply the crossOrigin attribute for local images", () => {

        const urls = [
            "./foo.jpg", "blob:http%3A//localhost%3A8383/568233a1-8b13-48b3-84d5-cca045ae384f", imgSource
        ];

        urls.forEach(( url => {
            Loader.loadImage( url, ( data ) => {
                assert.isUndefined( data.image.crossOrigin,
                    "expected crossOrigin attribute to be undefined for local images" );
            });
        }));
    });

    it( "should apply the crossOrigin attribute for remote images", () => {

        const urls = [
            "http://www.foo.jpg", "https://www.bar.jpg"
        ];

        urls.forEach(( url => {
            Loader.loadImage( url, ( data ) => {
                assert.strictEqual( "Anonymous", data.image.crossOrigin,
                    "expected crossOrigin attribute to be Anonymous for remote images" );
            });
        }));
    });

    it.skip( "should return the Image dimensions to the load callback", ( done ) => {

        Loader.loadImage( imgSource, ( data ) => {

            assert.ok( typeof data.size === "object", "expected size Object to have returned" );
            assert.strictEqual( 1, data.size.width,
                "expected Loader to have returned correct Image width" );
            assert.strictEqual( 1, data.size.height,
                "expected Loader to have returned correct Image height" );

            done();
        });
    });
});
