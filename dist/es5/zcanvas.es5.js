/**
 * a wrapper that exports the CommonJS pattern
 * of the source code for use in ES5-CommonJS projects
 *
 * NOTE: the requires here are relative to the "src"-folder
 */
"use strict";

var Canvas = require("./Canvas"),
    Sprite = require("./Sprite"),
    Loader = require("./Loader"),
    Collision = require("./Collision");

module.exports = {

  canvas: Canvas,
  sprite: Sprite,
  loader: Loader,
  collision: Collision
};