var chai          = require( "chai" );
var zCanvas       = require( "../../src/zCanvas" );
var zSprite       = require( "../../src/zSprite" );
var MockedBrowser = require( "../utils/MockedBrowser" );

describe( "zCanvas", function()
{
    /* setup */

    // use Chai assertion library
    var assert = chai.assert,
        expect = chai.expect;

    var width, height, framerate;

    // executed before the tests start running

    before( function()
    {
        // prepare mock browser
        MockedBrowser.init();
    });

    // executed when all tests have finished running

    after( function()
    {

    });

    // executed before each individual test

    beforeEach( function()
    {
        // generate random values
        width     = Math.round( Math.random() * 100 ) + 10;
        height    = Math.round( Math.random() * 100 ) + 10;
        framerate = Math.round( Math.random() * 50 )  + 10;
    });

    // executed after each individual test

    afterEach( function()
    {

    });

    /* actual unit tests */

    it( "should not construct without valid arguments", function()
    {
        expect( function()
        {
            new zCanvas();

        }).to.throw( /cannot construct a zCanvas without valid dimensions/ );

        expect( function()
        {
            new zCanvas( width );

        }).to.throw( /cannot construct a zCanvas without valid dimensions/ );

        expect( function()
        {
            new zCanvas( width, height );

        }).not.to.throw();
    });

    it( "should be able to extend its prototype into new function references", function()
    {
        var newClass = function() {};

        zCanvas.extend( newClass );

        assert.ok( new newClass() instanceof zCanvas,
            "expected an instance of newClass to equal the zCanvas prototype" );
    });

    it( "should return the construction arguments unchanged", function()
    {
        var canvas = new zCanvas( width, height, false, framerate );

        assert.strictEqual( width, canvas.getWidth(),
            "expected width to be " + width + ", got " + canvas.getWidth() + " instead" );

        assert.strictEqual( height, canvas.getHeight(),
            "expected height to be " + height + ", got " + canvas.getHeight() + " instead" );

        assert.strictEqual( framerate, canvas.getFrameRate(),
            "expected framerate to be " + framerate + ", got " + canvas.getFrameRate() + " instead" );
    });

    it( "should be able to insert itself into DOM", function()
    {
        var canvas  = new zCanvas( width, height );
        var element = global.document.createElement( "div" );

        assert.notOk( canvas.getElement().parentNode === element,
            "expected zCanvas not to be attached to element prior to insertion" );

        canvas.insertInPage( element );

        assert.strictEqual( element, canvas.getElement().parentNode,
            "expected zCanvas to be inserted into given expected DOM element" );
    });

    it( "should be able to add/remove children from its display list", function()
    {
        var canvas = new zCanvas( width, height );
        var child  = new zSprite( 0, 0, width, height );

        assert.notOk( canvas.contains( child ),
            "expected canvas not to contain the child in its display list" );

        canvas.addChild( child );

        assert.ok( canvas.contains( child ),
            "expected canvas to contain the child in its display list after addition" );

        assert.strictEqual( canvas, child.canvas,
            "expected the child to reference to given zCanvas" );

        var removed = canvas.removeChild( child );

        assert.notOk( canvas.contains( child ),
            "expected canvas not to contain the child in its display list after removal" );

        assert.strictEqual( removed, child,
            "expected removed sprite to equal the requested sprite" );
    });

    it( "should be able to add/remove children from specific indices in its display list", function()
    {
        var canvas = new zCanvas( width, height );
        var child1 = new zSprite( 0, 0, width, height );
        var child2 = new zSprite( 0, 0, width, height );
        var child3 = new zSprite( 0, 0, width, height );

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

        var removed = canvas.removeChildAt( 2 );

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

    it( "should be able to maintain the linked list of its children", function()
    {
        var canvas = new zCanvas( width, height );
        var sprite1 = new zSprite( 0, 0, width, height );
        var sprite2 = new zSprite( 0, 0, width, height );
        var sprite3 = new zSprite( 0, 0, width, height );

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

    it( "should be able to update the linked list of its children", function()
    {
        var canvas = new zCanvas( width, height );
        var sprite1 = new zSprite( 0, 0, width, height );
        var sprite2 = new zSprite( 0, 0, width, height );
        var sprite3 = new zSprite( 0, 0, width, height );

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

    it( "should invoke an update of its contents when invalidation is requested", function( done )
    {
        var canvas = new zCanvas( width, height );
        canvas.update = done; // hijack update method

        canvas.invalidate();
    });

    it( "should be able to return all lowest level children in its display list", function()
    {
        var canvas  = new zCanvas( width, height );
        var sprite1 = new zSprite( 0, 0, 50, 50 );
        var sprite2 = new zSprite( 0, 0, 50, 50 );

        assert.ok( canvas.getChildren() instanceof Array,
            "expected zCanvas to return all its children in an Array" );

        assert.strictEqual( 0, canvas.getChildren().length,
            "expected zCanvas not to contain children after construction" );

        canvas.addChild( sprite1 );

        assert.strictEqual( 1, canvas.getChildren().length,
            "expected zCanvas child list to contain 1 zSprite" );

        assert.ok( canvas.getChildren().indexOf( sprite1 ) === 0,
            "expected zCanvas to contain added child in the first index of its children list" );

        canvas.addChild( sprite2 );

        assert.strictEqual( 2, canvas.getChildren().length,
            "expected zCanvas child list to contain 2 zSprites" );

        assert.ok( canvas.getChildren().indexOf( sprite2 ) === 1,
            "expected zCanvas to contain added child in the second index of its children list" );
    });

    // TODO : getChildrenUnderPoint

    it( "should be able to update its dimensions", function()
    {
        var canvas = new zCanvas( width, height );

        var newWidth  = width,
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

    it( "should know whether its animatable", function()
    {
        var canvas = new zCanvas( width, height, false );

        assert.notOk( canvas.isAnimateable(),
            "expected canvas not to be animateable" );

        canvas = new zCanvas( width, height, true );

        assert.ok( canvas.isAnimateable(),
            "expected canvas to be animateable" );
    });

    it( "should invoke a render upon update request", function( done )
    {
        var orgRender = zCanvas.prototype.render;

        // hijack render method

        zCanvas.prototype.render = function()
        {
            zCanvas.prototype.render = orgRender; // restore hijacked method
            done();
        };

        var canvas = new zCanvas( width, height, false );

        canvas.update();
    });
});