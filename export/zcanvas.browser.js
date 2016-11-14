/**
 * a wrapper that exports the CommonJS pattern
 * of the source code to be available in the global document
 *
 * NOTE: the requires are relative to the "src"-folder
 */
"use strict";

const zCanvas = require( "./zCanvas"),
      zSprite = require( "./zSprite"),
      zLoader = require( "./zLoader" );

(function( scope ) {

    scope.zCanvas = zCanvas;
    scope.zSprite = zSprite;
    scope.zLoader = zLoader;

})( self );
