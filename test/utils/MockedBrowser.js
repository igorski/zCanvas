/**
 * MockedBrowser provides a browser-type environment
 * for the unit tests, with mocks for HTMLCanvasElement
 * and CanvasRenderingContext2D
 *
 * Created by igorzinken on 13-08-16.
 */
var MockBrowser = require( "mock-browser" ).mocks.MockBrowser;
var browser;

module.exports = {

    init: function() {

        // prepare mock browser
        browser                      = new MockBrowser();
        global.document              = browser.getDocument();
        global.window                = browser.getWindow();
        global.Image                 = global.window.Image;
        global.requestAnimationFrame = function( c ) { setTimeout( c, 4 ); };

        global.document.createElement = function( tagName ) {

            var out;
            if ( tagName === "canvas" ) {
                out = {
                    style : {},
                    getContext : function( type ) {
                        return {
                            scale                 : function( x, y ) {},
                            imageSmoothingEnabled : function() {},
                            fillRect              : function() {},
                            save                  : function() {},
                            restore               : function() {}
                        };
                    }
                }
            }
            else {
                out = {
                    parentNode: null,
                    appendChild: function( child ) {
                        child.parentNode = out;
                    },
                    removeChild: function( child ) {
                        if ( child.parentNode === out )
                            child.parentNode = null;
                    }
                }
            }
            return out;
        }
    }
};
