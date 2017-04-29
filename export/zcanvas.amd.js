/**
 * a wrapper that exports the CommonJS pattern
 * of the source code to be transformed into
 * the AMD RequireJS pattern
 *
 * NOTE: the requires here are relative to the "src"-folder
 */
"use strict";

const Canvas    = require( "./Canvas"),
      Sprite    = require( "./Sprite"),
      Loader    = require( "./Loader"),
      Collision = require( "./Collision" );

module.exports = {

    canvas:    Canvas,
    sprite:    Sprite,
    loader:    Loader,
    collision: Collision
};
