zCanvas
=======

JavaScript library for interacting with HTML Canvas drawables as if they were separate animatable, interactive Objects.
zCanvas is optimized for mobile devices, relying on optimal use of resources and works well with touch events, as such
zCanvas can be an excellent resource for creating (mobile) web games.

The concept of zCanvas encourages Object Oriented Programming, where each custom drawable Object you create for your
project should inherit its prototype from the sprite-"class". You'll find you'll only have to override two methods
for custom drawable logic and its visual rendering.

zCanvas will provide an API that takes care of all animation and update logic you'd associate with, for instance, a game
loop. However, the rendering logic (i.e. the "drawing" of the visual content) can be as low level as you'd like, by
drawing straight onto the <canvas> using the browsers CanvasRenderingContext2D-API.

zCanvas has been written in vanilla JavaScript and thus works independent from (and should work with) any other
JavaScript framework.

## Installation

You can get canvas via NPM:

    npm install canvas
    
## Project Integration

zCanvas is compatible with CommonJS, AMD/RequireJS or can be included in a document via script tags:

CommonJS:

    const zCanvas = require( "zcanvas" );
    
    // do something with zCanvas-properties:
    // "canvas", "sprite", "loader", "collision"
    
After which you can subsequently use a tool like Browserify to build your application for the browser (note that
a utility like Babel is necessary to transpile the ES6 code to ES5, if necessary).

RequireJS:

Use _zcanvas.amd.js_ inside the _dist/_-folder for a prebuilt, minimized RequireJS library

    require( [ "zcanvas.amd" ], function( zCanvas ) {
    
        // do something with zCanvas-properties:
        // "canvas", "sprite", "loader", "collision"      
    });

Browser:

    <script type="text/javascript" src="./dist/zcanvas.min.js"></script>
    <script type="text/javascript">
    
        // do something with globally available actors:
        // "canvas", "sprite", "loader", "collision"
    
    </script>

DisplayList convention
----------------------

Where the HTMLCanvasElement differs from other HTML elements in that its contents aren't visible as individual nodes (but rather, as pixels), zCanvas
provides an API that allows you to interact with drawable Objects as separate entities (called sprites), attaching logic to individual
elements leaving you, as developer, without the hassle of managing the relation of the drawn elements to the <canvas> element and DOM.

zCanvas follows the concept of the DisplayList (familiar to those knowledgeable in ActionScript 3) where drawable Objects
become visible on screen once they have been added to a container. sprites are also containers, so you can stack sprites
onto other sprites, without having to worry about z indices. If you're familiar with _addChild()_ and _removeChild()_, you're good to go.

Works practically everywhere
----------------------------

zCanvas has been written in ES6 and CommonJS users can enjoy this directly. zCanvas however
transpiles nicely back into ES5 and works in browsers from IE9 up. It has been tested and
verified to work on:

 * Internet Explorer 9+
 * Chrome for Windows, OS X and Linux
 * Apple Safari 6+ (including Mobile Safari)
 * Firefox 3.6+
 * Android browser 4+
 * Chrome for Android 4+

Optimized for high performance
------------------------------

zCanvas has been extensively optimized for the best performance and works a treat on mobile devices too. The amount of
event listeners attached to DOM elements are limited to the <canvas> only, where the internal interactions are delegated
to the sprites by the canvas.

Easily animatable
-----------------

As all rendering logic resides in a single method of your sprite, you can easily attach tweening libraries such as
the excellent TweenMax by Greensock to alter the visible properties of your sprites for maximum eye candy.

Build instructions
==================

The project dependencies are maintained by NPM, you can resolve them using:

    npm install

When using CommonJS for your project, it is recommended to require the source code directly. However, the project
can also be built directly for the browser using a simple Gulp task:

    gulp build
    
After which a folder _dist/_ is created which contains the prebuilt AMD/RequireJS library as well as a script
that can be included directly in a document. The source code is transpiled from ES6 to ES5 for maximum compatibility.

Unit testing
============

Unit tests are run via mocha, which is installed as a dependency. You can run the tests by running:

    npm test
    
Unit tests go in the _./test_-folder. The file name for a unit test must be equal to the file it is testing, but contain
the suffix "_.test_", e.g. _Functions.js_ will have a test file _Functions.test.js_. Note that all copy / concatenation /
production related Grunt tasks for JavaScripts must exclude the _.test._-files to avoid them being part of a production build.

NOTE : Node v4.0 or higher must be installed for running the tests (depends on jsdom)

Live Demo
=========

You can view some basic features in the down-and-dirty demos here :

 * [Demo #1: Spritesheets and pixel-perfect collisions](https://rawgithub.com/igorski/zcanvas/master/examples/demo1.html)
 * [Demo #2: Layers and interactions](https://rawgithub.com/igorski/zcanvas/master/examples/demo2.html)
 * [Demo #3: Integrating 3rd party animation libraries](https://rawgithub.com/igorski/zcanvas/master/examples/demo3.html)

The API / Documentation
=======================

Want to view the API? You can check the [zCanvas Wiki](https://github.com/igorski/zcanvas/wiki)

(or view the source contents of the demos listed above).
