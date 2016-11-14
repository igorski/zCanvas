/**
 * a wrapper that exports the CommonJS pattern
 * of the source code to be transformed into
 * the AMD RequireJS pattern
 *
 * NOTE: the requires are relative to the "src"-folder
 */
"use strict";

const zCanvas = require( "./zCanvas"),
      zSprite = require( "./zSprite"),
      zLoader = require( "./zLoader" );

module.exports = {

    zCanvas : zCanvas,
    zSprite : zSprite,
    zLoader : zLoader
};
