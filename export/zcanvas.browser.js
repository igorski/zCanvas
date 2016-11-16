/**
 * a wrapper that exports the CommonJS pattern
 * of the source code to be available in the global document
 *
 * NOTE: the requires are relative to the "src"-folder
 */
"use strict";

const Canvas    = require( "./Canvas"),
      Sprite    = require( "./Sprite"),
      Loader    = require( "./Loader"),
      Collision = require( "./Collision" );

(function( scope ) {

    scope.canvas = {
        canvas:    Canvas,
        sprite:    Sprite,
        loader:    Loader,
        collision: Collision
    };

})( self );
