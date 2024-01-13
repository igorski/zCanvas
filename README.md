# zCanvas

A lightweight JavaScript library for interacting with HTML Canvas "drawables" as if they were separately animatable, interactive objects. zCanvas is optimized for mobile devices, relying on optimal use of resources and works well with touch events; as such zCanvas can be an excellent resource for creating (mobile) browser based games. It is however also equally useful for creating complex graphical interfaces.

zCanvas is written in TypeScript, has no dependencies and works independently from (and thus works _with_) any other JavaScript framework.

### Why use zCanvas ?

zCanvas sure isn't the first JS Canvas rendering library, so to summarize:

 * it weighs a mere `15K gZipped`
 * uses Worker based rendering to free up CPU for your application on the main thread
 * loads image files from File / Blob / string (URL, Blob URL, base64 encoding) / HTMLImageElement / HTMLCanvasElement / ImageData / ImageBitmap sources
 * takes care of HDPI scaling and distortion-free stretching to present well on mobile screens
 * provides an abstraction layer close to - but with in-built optimizations for handling - _CanvasRenderingContext2D_ API draw calls.

 # Live Demos

You can view some basic features in the down-and-dirty demos here.

Note these demos were written in vanilla JavaScript without the use of any libraries (other than a transpiled version of zCanvas). You can have a peek at the source to see what's going on.

### Game demos

 * [Demo #1: Spritesheets, gameloops and fast collision detection](https://rawgithub.com/igorski/zcanvas/master/examples/demo1.html)
  * [Demo #2: Pixel-perfect collisions and clipping viewports](https://rawgithub.com/igorski/zcanvas/master/examples/demo2.html)

### Graphics manipulation demos

 * [Demo #3: Layers and pointer interactions](https://rawgithub.com/igorski/zcanvas/master/examples/demo3.html)
 * [Demo #4: Integrating 3rd party animation library](https://rawgithub.com/igorski/zcanvas/master/examples/demo4.html)
  * [Demo #5: Integrating 3rd party physics library](https://rawgithub.com/igorski/zcanvas/master/examples/demo5.html)
 * [Demo #6: Local image manipulation](https://rawgithub.com/igorski/zcanvas/master/examples/demo6.html)
 * [Demo #7: Scrollable viewport](https://rawgithub.com/igorski/zcanvas/master/examples/demo7.html) 
 * [Demo #8: Audio waveform analyser](https://rawgithub.com/igorski/zcanvas/master/examples/demo8.html)

## Real-life examples

zCanvas is used in proprietary image editing software, but is also the rendering engine behind
[Bitmappery](https://www.igorski.nl/application/bitmappery/) (image editor) and [Pinball Schminball](https://www.igorski.nl/application/pinball-schminball/) (2D pinball game).

## DisplayList convention

Where the `HTMLCanvasElement` differs from other HTML elements (in that its content isn't represented as individual nodes inside the DOM but directly drawn as pixels onto a single surface), zCanvas provides an API that allows you to interact with drawable objects as individual entities (called `Sprites`), attaching logic to individual elements, leaving you as a developer without the hassle of managing the (lack of) relationship between the canvas contents and the surrounding DOM.

zCanvas follows the concept of the DisplayList where drawable objects become visible on screen once they have been added to a container. Sprites are also containers, so you can stack Sprites onto other Sprites, without having to worry about z indices.

zCanvas will provide an API that takes care of all animation and update logic you'd associate with, for instance, a game loop, rendering images or even using animated spritesheets. You'll find that in regular use you'll hardly ever have to override the basic Sprite behaviour. However, the rendering logic (i.e. the "_drawing_" of the visual content) can be as low level as you'd like, by drawing straight onto the HTMLCanvasElement using the browsers _CanvasRenderingContext2D_-API, albeit with an abstraction layer that handles performance optimizations under the hood.

## Optimized for high performance

zCanvas has been optimized extensively for best performance and works a treat on mobile devices. The amount of event listeners attached to DOM elements are limited to the `HTMLCanvasElement` only, where the internal interactions are delegated to the Sprites visible on the canvas. Events triggering updates on the display list are automatically debounced to only render _once per animation frame_.

In environments where `OffscreenCanvas` is supported, the rendering will _automatically_ be offloaded onto
a Worker, freeing up the main thread of your application considerably.

As mentioned before, zCanvas is also tiny and adds little overhead to your application size.

## Easily animatable

As all rendering logic resides within a single method of your Sprite, you can easily attach animation libraries such as the excellent GreenSock Animation Platform to alter the visible properties of your sprites for maximum eye candy.

Additionally, zCanvas comes with built-in frame throttling logic that allows game like implementations to
update at the same speed, regardless of the rendering capabilities (e.g. achievable _frames per second_) of the environment.

## Works practically everywhere

zCanvas has been written to work within a ES module structure, but comes prebuilt and transpiled to work
in either a module, CommonJS or a browser environment. zCanvas has been tested and verified to work on all half-decent, half-recent browsers.

Should you however wish to support one of the ancient browsers listed below, zCanvas up to version [5.1.10](https://github.com/igorski/zCanvas/releases/tag/5.1.10) can cater to the following:

 * Internet Explorer 9+ (note: requires polyfill for `requestAnimationFrame`)
 * Chrome 22+
 * Apple Safari 6+ (including Mobile Safari)
 * Firefox 4+
 * Android browser 4.4+

 _*Note IE9 and some other browsers might need a polyfill for `Promise` at the versions listed above, but it is
 likely any of those are on auto update channels and at way higher versions in the wild._ It just works.

# The API / Documentation

Want to view the API? You can check the [zCanvas Wiki](https://github.com/igorski/zcanvas/wiki) which describes
all the common actors, functions and utilities while also providing documentation with regards to performance
optimizations as well as catering for several use cases.

_(for those craving a more hands-on approach, you can also view the source contents of the demos listed above)_

## Installation

You can get zCanvas via NPM:

```
npm install zcanvas
```

## Project Integration

zCanvas is compatible with ES6 modules, CommonJS, AMD/RequireJS or can be included in a document via script tags:

### ES6 module:

```
import { Canvas, Loader, Sprite } from "zcanvas";
```

After which you can subsequently use a tool like Webpack to bundle your application for the browser.

### RequireJS

Use `zcanvas.umd.js` inside the `dist`-folder for a prebuilt, minimized RequireJS library transpiled to JS.

```
require([ "zcanvas.amd" ], zCanvas => {
    const { Canvas, Loader, Sprite } = zCanvas;  
});
```

### Browser:

Use `zcanvas.iife.js` inside the `dist`-folder for a prebuilt, minimized library transpiled to JS.

```
<script type="text/javascript" src="./dist/zcanvas.min.js"></script>
<script type="text/javascript">

    const { Canvas, Loader, Sprite } = zcanvas;

</script>
```

## Build instructions

To those willing to contribute, the following build targets exist.
The project dependencies are maintained by NPM, you can resolve them using:

```
npm install
```

You can build the module, AMD and IIFE versions of the library using:

```
npm run build
```

After which a folder _./dist/_ is created which contains the different formats.

## Unit testing

Unit tests are run via Vitest, you can run the tests by running:

```
npm run test
```

Unit tests go in the _./test_-folder. The file name for a unit test must be equal to the file it is testing, but contain the suffix "_.spec_", e.g. _functions.ts_ should have a test file _functions.spec.ts_.

## Type checking

Run

```
npm run typecheck
```

To verify whether the code contains valid TypeScript.

To generate the type definitions file, run :

```
npm run types
```

after which `types/zcanvas.d.ts` is created in the _./dist/_-folder.