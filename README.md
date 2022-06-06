# zCanvas

A lightweight JavaScript library for interacting with HTML Canvas drawables as if they were separately animatable, interactive objects. zCanvas is optimized for mobile devices, relying on optimal use of resources and works well with touch events; as such zCanvas can be an excellent resource for creating (mobile) browsed based games. It is however also equally useful for creating complex graphical interfaces.

The concept of zCanvas encourages an object oriented approach, where each custom drawable you create for your project inherits its prototype from the _sprite_-class. Don't be frightened by the mention of _OOP_ however, zCanvas is equally useful if you prefer _functional programming_.

zCanvas will provide an API that takes care of all animation and update logic you'd associate with, for instance, a game loop, rendering images or even using animated spritesheets. You'll find that in regular use you'll hardly ever have to override the basic sprite behaviour. However, the rendering logic (i.e. the "drawing" of the visual content) can be as low level as you'd like, by drawing straight onto the HTMLCanvasElement using the browsers _CanvasRenderingContext2D_-API.

zCanvas has been written in vanilla JavaScript (ES2018 dialect) but comes with TypeScript annotations and works independently from (in thus works _with_) any other JavaScript framework.

## DisplayList convention

Where the _HTMLCanvasElement_ differs from other HTML elements (in that its contents aren't visible as individual nodes in the DOM but are directly drawn as pixels onto a single surface), zCanvas provides an API that allows you to interact with drawable objects as individual entities (called _Sprites_), attaching logic to individual elements, leaving you as a developer without the hassle of managing the (lack of) relationship between the canvas contents and the surrounding DOM.

zCanvas follows the concept of the DisplayList where drawable objects become visible on screen once they have been added to a container. Sprites are also containers, so you can stack Sprites onto other Sprites, without having to worry about z indices.

## Optimized for high performance

zCanvas has been optimized extensively for the best performance and works a treat on mobile devices too. The amount of event listeners attached to DOM elements are limited to the _HTMLCanvasElement_ only, where the internal interactions are delegated to the sprites by the canvas. Events triggering updates on the display list are automatically debounced to only render once per animation frame.

## Easily animatable

As all rendering logic resides within a single method of your Sprite, you can easily attach animation libraries such as the excellent TweenMax by Greensock to alter the visible properties of your sprites for maximum eye candy.

Additionally, zCanvas comes with built-in frame throttling logic that allows game like implementations to
update at the same speed, regardless of the rendering (frames per second) capabilities of the environment.

## Works practically everywhere

zCanvas has been written to work within a ES module structure, but comes prebuilt and transpiled to work
in either a module, CommonJS or browser environment (23K before GZip). zCanvas has been tested and verified to work on:

 * Internet Explorer 9+ (note: requires polyfill for _requestAnimationFrame_ and _Promise_)
 * Chrome for Windows, OS X and Linux
 * Apple Safari 6+ (including Mobile Safari)
 * Firefox 3.6+
 * Android browser 4+
 * Chrome for Android 4+

Judging from those ancient version numbers, it's safe to state zCanvas will work in _any recent browser without the need for any polyfills_.

# The API / Documentation

Want to view the API? You can check the [zCanvas Wiki](https://github.com/igorski/zcanvas/wiki) which describes
all the common actors, functions and utilities while also providing documentation with regards to performance
optimizations as well as catering for several use cases.

_(for those craving a more hands-on approach, you can also view the source contents of the demos listed below)_

## Installation

You can get zCanvas via NPM:

```
npm install zcanvas
```

## Project Integration

zCanvas is compatible with ES6 modules, CommonJS, AMD/RequireJS or can be included in a document via script tags:

### ES6 module:

```
import { canvas, sprite, loader, collision } from "zcanvas";
```

After which you can subsequently use a tool like Webpack to bundle your application for the browser.

### RequireJS

Use _zcanvas.amd.js_ inside the _dist/_-folder for a prebuilt, minimized RequireJS library transpiled to ES5.

```
require( [ "zcanvas.amd" ], function( zCanvas ) {
    // do something with zCanvas-properties:
    // "canvas", "sprite", "loader", "collision"      
});
```

### Browser:

Use _zcanvas.min.js_ inside the _dist/_-folder for a prebuilt, minimized library transpiled to ES5.

```
<script type="text/javascript" src="./dist/zcanvas.min.js"></script>
<script type="text/javascript">

    // do something with globally available actors:
    // "canvas", "sprite", "loader", "collision"

</script>
```

## Build instructions

The project dependencies are maintained by NPM, you can resolve them using:

```
npm install
```

When using CommonJS for your project, it is recommended to require the source code directly. However, the project
can also be built directly for the browser using a simple NPM task:

```
npm run build
```

After which a folder _dist/_ is created which contains the prebuilt AMD/RequireJS library as well as a script that can be included directly in a document. The source code is transpiled from ES6 to ES5 for maximum compatibility.

## Unit testing

Unit tests are run via jest, you can run the tests by running:

```
npm run test
```

Unit tests go in the _./test_-folder. The file name for a unit test must be equal to the file it is testing, but contain the suffix "_.spec_", e.g. _functions.js_ should have a test file _functions.spec.js_.

# Live Demos

You can view some basic features in the down-and-dirty demos here.

Note these demos were written in good old ES5 without the use of any libraries (other than RequireJS to load a transpiled zCanvas), just to make them instantly available to even the oldest of browsers.

### Game demos

 * [Demo #1: Spritesheets and pixel-perfect collisions](https://rawgithub.com/igorski/zcanvas/master/examples/demo1.html)
 * [Demo #2: Custom game loop and fast collision detections](https://rawgithub.com/igorski/zcanvas/master/examples/demo2.html)

### Graphics manipulation demos

 * [Demo #3: Layers and interactions](https://rawgithub.com/igorski/zcanvas/master/examples/demo3.html)
 * [Demo #4: Integrating 3rd party animation libraries](https://rawgithub.com/igorski/zcanvas/master/examples/demo4.html)
 * [Demo #5: Local image manipulation](https://rawgithub.com/igorski/zcanvas/master/examples/demo5.html)
 * [Demo #6: Pannable viewport](https://rawgithub.com/igorski/zcanvas/master/examples/demo6.html)

## Real-life examples

zCanvas is used in proprietary image editing software, but is also the rendering engine behind
[Bitmappery](https://www.igorski.nl/application/bitmappery/), a Vue based application which is also fully [open source](https://github.com/igorski/bitmappery).
