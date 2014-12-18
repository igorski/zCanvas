zCanvas
=======

JavaScript library for interacting with HTML Canvas drawables as if they were separate animatable, interactive Objects.
zCanvas is optimized for mobile devices, relying on optimal use of resources and works well with touch events, as such
zCanvas can be an excellent resource for creating (mobile) web games.

The concept of zCanvas encourages Object Oriented Programming, where each custom drawable Object you create for your
project should inherit its prototype from the zSprite-"class". You'll find you'll only have to override two methods
for custom drawable logic and its visual rendering.

zCanvas will provide an API that takes care of all animation and update logic you'd associate with, for instance, a game
loop. However, the rendering logic (i.e. the "drawing" of the visual content) can be as low level as you'd like, by
drawing straight onto the <canvas> using the browsers CanvasRenderingContext2D-API.

zCanvas has been written in vanilla JavaScript and thus works independent from (and should work with) any other
JavaScript framework.

DisplayList convention
----------------------

Where the HTMLCanvasElement differs from other HTML elements in that its contents aren't visible as individual nodes (but rather, as pixels), zCanvas
provides an API that allows you to interact with drawable Objects as separate entities (called zSprites), attaching logic to individual
elements leaving you, as developer, without the hassle of managing the relation of the drawn elements to the <canvas> element and DOM.

zCanvas follows the concept of the DisplayList (familiar to those knowledgeable in ActionScript 3) where drawable Objects
become visible on screen once they have been added to a container. zSprites are also containers, so you can stack zSprites
onto other zSprites, without having to worry about z indices. If you're familiar with addChild and removeChild, you're good to go.

Optimized for high performance
------------------------------

zCanvas has been extensively optimized for the best performance and works a treat on mobile devices too. The amount of
event listeners attached to DOM elements are limited to the <canvas> only, where the internal interactions are delegated
to the zSprites by the zCanvas.

Easily animatable
-----------------

As all rendering logic resides in a single method of your zSprite, you can easily attach tweening libraries such as
the excellent TweenMax by Greensock to alter the visible properties of your zSprite for maximum eye candy.

Documentation
=============

Want to view the API ? You can check the wiki here : https://github.com/igorski/zCanvas/wiki/zCanvas-overview

Live Demo
=========

You can view some basic features in the down-and-dirty demos here :

Game-like demo showcasing the use of sprite sheets for animating characters:

https://rawgithub.com/igorski/zCanvas/master/examples/demo1.html

Demo showcasing the layering and masking effects, both mouse and touch responsive.

https://rawgithub.com/igorski/zCanvas/master/examples/demo2.html
