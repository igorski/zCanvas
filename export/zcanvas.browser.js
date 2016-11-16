/**
 * a wrapper that exports the CommonJS pattern
 * of the source code to be available in the global document
 *
 * NOTE: the requires are relative to the "src"-folder
 */
"use strict";

const canvas    = require( "./canvas"),
      sprite    = require( "./sprite"),
      loader    = require( "./loader"),
      collision = require( "./collision" );

(function( scope ) {

    scope.canvas = {
        canvas:    canvas,
        sprite:    sprite,
        loader:    loader,
        collision: collision
    };

})( self );
