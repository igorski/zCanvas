/**
 * a wrapper that exports the CommonJS pattern
 * of the source code to be transformed into
 * the AMD RequireJS pattern
 *
 * NOTE: the requires are relative to the "src"-folder
 */
"use strict";

const canvas    = require( "./canvas"),
      sprite    = require( "./sprite"),
      loader    = require( "./loader"),
      collision = require( "./collision" );

module.exports = {

    canvas:    canvas,
    sprite:    sprite,
    loader:    loader,
    collision: collision
};
