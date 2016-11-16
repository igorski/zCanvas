"use strict";

const chai          = require( "chai" );
const MockedBrowser = require( "./utils/MockedBrowser" );
const Canvas        = require( "../src/Canvas" );
const Sprite        = require( "../src/Sprite" );

describe( "zCanvas.canvas", () => {
    
    /* setup */

    // use Chai assertion library
    const assert = chai.assert,
          expect = chai.expect;

    let width, height, framerate, animate, smoothing;

    // executed before the tests start running

    before( () => {
        // prepare mock browser
        MockedBrowser.init();
    });

    // executed when all tests have finished running

    after( () => {

    });

    // executed before each individual test

    beforeEach( () => {
        // generate random values
        width     = Math.round( Math.random() * 100 ) + 10;
        height    = Math.round( Math.random() * 100 ) + 10;
        framerate = Math.round( Math.random() * 50 )  + 10;
        animate   = ( Math.random() > .5 );
        smoothing = ( Math.random() > .5 );
    });

    // executed after each individual test

    afterEach( () => {

    });

    /* actual unit tests */

    it( "should construct with the legacy multi-argument list", () => {

        const canvas = new Canvas( width, height, animate, framerate );

        assert.strictEqual( width, canvas.getWidth() );
        assert.strictEqual( height, canvas.getHeight() );
        assert.strictEqual( animate, canvas.isAnimatable() );
        assert.strictEqual( framerate, canvas.getFrameRate() );
    });

    it( "should construct with a single data Object", () => {

        const canvas = new Canvas({
            width: width,
            height: height,
            animate: animate,
            fps: framerate
        });

        assert.strictEqual( width, canvas.getWidth() );
        assert.strictEqual( height, canvas.getHeight() );
        assert.strictEqual( animate, canvas.isAnimatable() );
        assert.strictEqual( framerate, canvas.getFrameRate() );
    });

    it( "should not construct with zero or negative dimensions specified", () => {

        expect( () => {

            new Canvas({ width: 0, height: 0 });

        }).to.throw( /cannot construct a zCanvas without valid dimensions/ );

        expect( () => {

            new Canvas({ width: -100, height: -100 });

        }).to.throw( /cannot construct a zCanvas without valid dimensions/ );
    });

    it( "should by default construct with 300 x 300 dimensions", () => {

        const canvas = new Canvas();

        assert.strictEqual( 300, canvas.getWidth(),
            "expected canvas width to equal the expected default" );

        assert.strictEqual( 300, canvas.getHeight(),
            "expected canvas height to equal the expected default" );
    });

    it( "should be able to extend its prototype into new function references", () => {

        const newClass = function() {};
        Canvas.extend( newClass );

        assert.ok( new newClass() instanceof Canvas,
            "expected an instance of newClass to equal the canvas prototype" );
    });

    it( "should return the construction arguments unchanged", () => {

        const canvas = new Canvas({
            width: width,
            height: height,
            fps: framerate,
            smoothing: smoothing,
            animate: animate
        });

        assert.strictEqual( width, canvas.getWidth(),
            "expected width to be " + width + ", got " + canvas.getWidth() + " instead" );

        assert.strictEqual( height, canvas.getHeight(),
            "expected height to be " + height + ", got " + canvas.getHeight() + " instead" );

        assert.strictEqual( framerate, canvas.getFrameRate(),
            "expected framerate to be " + framerate + ", got " + canvas.getFrameRate() + " instead" );

        assert.strictEqual( smoothing, canvas._smoothing,
            "expected smoothing to equal the constructor value" );

        assert.strictEqual( animate, canvas.isAnimatable(),
            "expected animate to equal the constructor value" );
    });

    it( "should be able to insert itself into DOM", () =>
    {
        const canvas  = new Canvas();
        const element = global.document.createElement( "div" );

        assert.notOk( canvas.getElement().parentNode === element,
            "expected canvas not to be attached to element prior to insertion" );

        canvas.insertInPage( element );

        assert.strictEqual( element, canvas.getElement().parentNode,
            "expected canvas to be inserted into given expected DOM element" );
    });

    it( "should be able to add/remove children from its display list", () =>
    {
        const canvas = new Canvas({ width: width, height: height });
        const child  = new Sprite({ width: width, height: height });

        assert.notOk( canvas.contains( child ),
            "expected canvas not to contain the child in its display list" );

        canvas.addChild( child );

        assert.ok( canvas.contains( child ),
            "expected canvas to contain the child in its display list after addition" );

        assert.strictEqual( canvas, child.canvas,
            "expected the child to reference to given canvas" );

        const removed = canvas.removeChild( child );

        assert.notOk( canvas.contains( child ),
            "expected canvas not to contain the child in its display list after removal" );

        assert.strictEqual( removed, child,
            "expected removed sprite to equal the requested sprite" );
    });

    it( "should be able to add/remove children from specific indices in its display list", () => {

        const canvas = new Canvas({ width: width, height: height });
        const child1 = new Sprite({ width: width, height: height });
        const child2 = new Sprite({ width: width, height: height });
        const child3 = new Sprite({ width: width, height: height });

        assert.strictEqual( 0, canvas.numChildren(),
            "expected the amount of children to be 0 after construction, got " + canvas.numChildren() + " instead" );

        canvas.addChild( child1 );

        assert.strictEqual( 1, canvas.numChildren(),
            "expected the amount of children to be 1 after addition of a sprite, got " + canvas.numChildren() + " instead" );

        canvas.addChild( child2 );

        assert.strictEqual( 2, canvas.numChildren(),
            "expected the amount of children to be 2 after addition of 2 sprites, got " + canvas.numChildren() + " instead" );

        assert.strictEqual( child1, canvas.getChildAt( 0 ),
            "expected the sprite at index 0 to equal the expected sprite" );

        assert.strictEqual( child2, canvas.getChildAt( 1 ),
            "expected the sprite at index 0 to equal the expected sprite" );

        canvas.addChild( child3 );

        // test removals

        let removed = canvas.removeChildAt( 2 );

        assert.strictEqual( 2, canvas.numChildren(),
            "expected the amount of children to be 2 after removal of 1 sprite, got " + canvas.numChildren() + " instead" );

        assert.strictEqual( removed, child3,
            "expected the removed child to equal the expected child" );

        removed = canvas.removeChildAt( 0 );

        assert.notOk( canvas.contains( child1 ),
            "expected child to have been removed from the display list" );

        assert.strictEqual( 1, canvas.numChildren(),
            "expected the amount of children to be 1 after removal of 1 sprite, got " + canvas.numChildren() + " instead" );

        assert.strictEqual( removed, child1,
            "expected removed child to equal the expected child" );

        removed = canvas.removeChildAt( 0 );

        assert.notOk( canvas.contains( child2 ),
            "expected the sprite to have been removed from the display list" );

        assert.strictEqual( 0, canvas.numChildren(),
            "expected the amount of children to be 0 after removal of 2 sprites, got " + canvas.numChildren() + " instead" );

        assert.ok( removed, child2,
            "expected removed child to equal the expected child" );
    });

    it( "should be able to maintain the linked list of its children", () => {

        const canvas  = new Canvas({ width: width, height: height });
        const sprite1 = new Sprite({ width: width, height: height });
        const sprite2 = new Sprite({ width: width, height: height });
        const sprite3 = new Sprite({ width: width, height: height });

        // add first child

        canvas.addChild( sprite1 );

        assert.isNull( sprite1.last, "expected sprite1 not to have a last sibling" );
        assert.isNull( sprite1.next, "expected sprite1 not to have a next sibling" );

        // add second child

        canvas.addChild( sprite2 );

        assert.isNull( sprite1.last, "expected sprite1 not to have a previous sibling" );
        assert.strictEqual( sprite2, sprite1.next, "expected sprite2 to be the next sibling of sprite1" );
        assert.strictEqual( sprite1, sprite2.last, "expected sprite1 to be the last sibling of sprite2" );
        assert.isNull( sprite2.next, "expected sprite2 not to have a next sibling" );

        // add third child

        canvas.addChild( sprite3 );

        assert.isNull( sprite1.last, "expected sprite1 not to have a last sibling" );
        assert.strictEqual( sprite2, sprite1.next, "expected sprite2 to be the next sibling of sprite1" );
        assert.strictEqual( sprite1, sprite2.last, "expected sprite1 to be the last sibling of sprite2" );
        assert.strictEqual( sprite3, sprite2.next, "expected sprite3 to be the next sibling of sprite2" );
        assert.strictEqual( sprite2, sprite3.last, "expected sprite2 to be the last sibling of sprite3" );
        assert.isNull( sprite3.next, "expected sprite3 not to have a next sibling" );
    });

    it( "should be able to update the linked list of its children", () => {

        const canvas  = new Canvas({ width: width, height: height });
        const sprite1 = new Sprite({ width: width, height: height });
        const sprite2 = new Sprite({ width: width, height: height });
        const sprite3 = new Sprite({ width: width, height: height });

        // add children

        canvas.addChild( sprite1 );
        canvas.addChild( sprite2 );
        canvas.addChild( sprite3 );

        // assert list is updated when middle child is removed

        canvas.removeChild( sprite2 );

        assert.isNull( sprite2.last, "expected sprite2 not to have a last sibling as it was removed" );
        assert.isNull( sprite2.next, "expected sprite2 not to have a next sibling as it was removed" );
        assert.strictEqual( sprite3, sprite1.next, "expected sprite3 to be the next sibling of sprite1" );
        assert.strictEqual( sprite1, sprite3.last, "expected sprite1 to be the last sibling of sprite3" );

        // remove last child

        canvas.removeChild( sprite3 );

        assert.isNull( sprite3.last, "expected sprite3 not to have a last sibling as it was removed" );
        assert.isNull( sprite3.next, "expected sprite3 not to have a next sibling as it was removed" );
        assert.isNull( sprite1.next, "expected sprite1 not to have a next sibling" );
    });

    it( "should be able to return all lowest level children in its display list", () => {

        const canvas  = new Canvas({ width: width, height: height });
        const sprite1 = new Sprite({ width: width, height: height });
        const sprite2 = new Sprite({ width: width, height: height });

        assert.ok( canvas.getChildren() instanceof Array,
            "expected canvas to return all its children in an Array" );

        assert.strictEqual( 0, canvas.getChildren().length,
            "expected canvas not to contain children after construction" );

        canvas.addChild( sprite1 );

        assert.strictEqual( 1, canvas.getChildren().length,
            "expected canvas child list to contain 1 sprite" );

        assert.ok( canvas.getChildren().indexOf( sprite1 ) === 0,
            "expected canvas to contain added child in the first index of its children list" );

        canvas.addChild( sprite2 );

        assert.strictEqual( 2, canvas.getChildren().length,
            "expected canvas child list to contain 2 sprites" );

        assert.ok( canvas.getChildren().indexOf( sprite2 ) === 1,
            "expected canvas to contain added child in the second index of its children list" );
    });

    // TODO : getChildrenUnderPoint

    it( "should be able to update its dimensions", () => {

        const canvas = new Canvas({ width: width, height: height });

        let newWidth  = width,
            newHeight = height;

        while ( newWidth === width )
            newWidth = Math.round( Math.random() * 1000 ) + 1;

        while ( newHeight === height )
            newHeight = Math.round( Math.random() * 1000 ) + 1;

        canvas.setDimensions( newWidth, newHeight );

        assert.strictEqual( newWidth, canvas.getWidth(),
            "expected new width to be " + newWidth + ", got " + canvas.getWidth() + " instead" );

        assert.strictEqual( newHeight, canvas.getHeight(),
            "expected new height to be " + newHeight + ", got " + canvas.getHeight() + " instead" );
    });

    it( "should know whether its animatable", () => {

        let canvas = new Canvas({
            width: width,
            height: height,
            animate: false
        });

        assert.notOk( canvas.isAnimatable(),
            "expected canvas not to be animatable" );

        canvas = new Canvas({
            width: width,
            height: height,
            animate: true
        });

        assert.ok( canvas.isAnimatable(),
            "expected canvas to be animatable" );
    });
    
    it( "should be able to toggle its animatable state", () => {

        const canvas = new Canvas({
            width: width,
            height: height,
            animate: false
        });
        
        canvas.setAnimatable( true );
        assert.ok( canvas.isAnimatable(), "expected canvas to be animatable" );

        canvas.setAnimatable( false );
        assert.notOk( canvas.isAnimatable(), "expected canvas not to be animatable" );
    });

    it( "should continuously render on each animation frame when animatable", function( done ) {

        const canvas = new Canvas({
            width: width,
            height: height,
            animate: false
        });

        // hijack bound render handlers

        const hijackedHandler = canvas._renderHandler;
        let renders = 0;

        canvas._renderHandler = () => {

            if ( ++renders === 5 )
                done();
            else
                hijackedHandler();
        };
        canvas.setAnimatable( true );
    });

    it( "should only render on invalidation when not animatable", function( done ) {

        // construct as animatable
        const canvas = new Canvas({
            width: width,
            height: height,
            animate: true
        });

        // now disable animation
        canvas.setAnimatable(false);

        // hijack bound render handlers

        const hijackedHandler = canvas._renderHandler;
        let renders = 0;

        canvas._renderHandler = () => {
            ++renders;
            hijackedHandler();
        };

        setTimeout( () => {

            assert.strictEqual( 0, renders,
                "expected render count not to have incremented after disabling of animatable state" );

            canvas._renderHandler = done; // hijack render to end test
            canvas.invalidate(); // call invalidate to render and end this test

        }, 25 );
    });

    it( "should invoke a render upon invalidation request", function( done ) {

        const orgRender = Canvas.prototype.render;

        // hijack render method

        Canvas.prototype.render = () => {
            Canvas.prototype.render = orgRender; // restore hijacked method
            done();
        };

        const canvas = new Canvas({
            width: width,
            height: height,
            animate: false
        });

        canvas.invalidate();
    });

    it( "should invoke the update()-method of its children upon render", function( done ) {

        const canvas = new Canvas({
            width: width,
            height: height,
            animate: false
        });
        const sprite = new Sprite({ width: 10, height: 10 });
        canvas.addChild( sprite );

        sprite.update = () => {
            done();
        };
        canvas.invalidate();
    });

    it( "should not invoke the update()-method of its children if a custom external " +
        "update handler was configured", ( done ) => {

        const handler = () => {
            setTimeout( done, 10 );
        };

        const canvas = new Canvas({
            width: width,
            height: height,
            animate: false,
            onUpdate: handler
        });

        const sprite = new Sprite({ width: 10, height: 10 });
        canvas.addChild( sprite );

        sprite.update = () => {
            throw new Error( "sprite update should not have been called" );
        };
        canvas.invalidate();
    });
});
