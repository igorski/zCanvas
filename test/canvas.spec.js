import Canvas from "../src/Canvas";
import Sprite from "../src/Sprite";

describe( "zCanvas.canvas", () => {

    /* setup */

    let width, height, fps, animate, smoothing;

    // executed before each individual test

    beforeEach( () => {
        // generate random values
        width     = Math.round( Math.random() * 100 ) + 10;
        height    = Math.round( Math.random() * 100 ) + 10;
        fps       = Math.round( Math.random() * 50 )  + 10;
        animate   = ( Math.random() > .5 );
        smoothing = ( Math.random() > .5 );
    });

    /* actual unit tests */

    it( "should construct with a single data Object", () => {
        const canvas = new Canvas({ width, height, animate, fps });

        expect( canvas.getWidth() ).toEqual( width );
        expect( canvas.getHeight() ).toEqual( height );
        expect( canvas.isAnimatable() ).toEqual( animate );
        expect( canvas.getFrameRate() ).toEqual( fps );
    });

    it( "should not construct with zero or negative dimensions specified", () => {
        expect(() => {
            new Canvas({ width: 0, height: 0 });
        }).toThrow( /cannot construct a zCanvas without valid dimensions/ );

        expect(() => {
            new Canvas({ width: -100, height: -100 });
        }).toThrow( /cannot construct a zCanvas without valid dimensions/ );
    });

    it( "should by default construct with 300 x 300 dimensions", () => {
        const canvas = new Canvas();
        expect( canvas.getWidth() ).toEqual( 300 );
        expect( canvas.getHeight() ).toEqual( 300 );
    });

    it( "should be able to extend its prototype into new function references", () => {
        const newClass = function() {};
        Canvas.extend( newClass );

        expect( new newClass() instanceof Canvas ).toBe( true );
    });

    it( "should return the construction arguments unchanged", () => {
        const canvas = new Canvas({ width, height, fps, smoothing, animate });

        expect( canvas.getWidth() ).toEqual( width );
        expect( canvas.getHeight() ).toEqual( height );
        expect( canvas.getFrameRate() ).toEqual( fps );
        expect( canvas._smoothing ).toEqual( smoothing );
        expect( canvas.isAnimatable() ).toEqual( animate );
    });

    it( "should be able to insert itself into DOM", () => {
        const canvas  = new Canvas();
        const element = global.document.createElement( "div" );

        // expected canvas not to be attached to element prior to insertion
        expect( canvas.getElement().parentNode ).not.toEqual( element );

        canvas.insertInPage( element );

        // expected canvas to be inserted into given expected DOM element
        expect( canvas.getElement().parentNode ).toEqual( element );
    });

    it( "should be able to add/remove children from its display list", () => {
        const canvas = new Canvas({ width, height });
        const child  = new Sprite({ width, height });

        expect( canvas.contains( child )).toBe( false );
        canvas.addChild( child );
        expect( canvas.contains( child )).toBe( true );
        expect( child.canvas ).toEqual( canvas ); // expected the child to reference to given canvas

        const removed = canvas.removeChild( child );

        expect( canvas.contains( child )).toBe( false );
        expect( removed ).toEqual( child ); // expected removed sprite to equal the requested sprite" );
    });

    it( "should be able to add/remove children from specific indices in its display list", () => {
        const canvas = new Canvas({ width, height });
        const child1 = new Sprite({ width, height });
        const child2 = new Sprite({ width, height });
        const child3 = new Sprite({ width, height });

        expect( canvas.numChildren() ).toEqual( 0 );

        canvas.addChild( child1 );
        expect( canvas.numChildren() ).toEqual( 1 );

        canvas.addChild( child2 );
        expect( canvas.numChildren() ).toEqual( 2 );

        expect( canvas.getChildAt( 0 )).toEqual( child1 );
        expect( canvas.getChildAt( 1 )).toEqual( child2 );

        canvas.addChild( child3 );
        expect( canvas.numChildren() ).toEqual ( 3 );

        // test removals

        let removed = canvas.removeChildAt( 2 );

        expect( canvas.numChildren() ).toEqual ( 2 );
        expect( removed ).toEqual( child3 );

        removed = canvas.removeChildAt( 0 );

        expect( canvas.contains( child1 )).toBe( false );
        expect( canvas.numChildren() ).toEqual ( 1 );
        expect( removed ).toEqual( child1 );

        removed = canvas.removeChildAt( 0 );

        expect( canvas.contains( child2 )).toBe( false );
        expect( canvas.numChildren() ).toEqual ( 0 );
        expect( removed ).toEqual( child2 );
    });

    it("should not append the same child twice", () => {
        const canvas = new Canvas({ width: 10, height: 10 });
        const sprite = new Sprite({ width: 10, height: 10 });

        expect( canvas.numChildren() ).toEqual( 0 );

        canvas.addChild( sprite );
        expect( canvas.numChildren() ).toEqual( 1 );

        canvas.addChild( sprite );
        expect( canvas.numChildren() ).toEqual( 1 );
    });

    it( "should be able to maintain the linked list of its children", () => {
        const canvas  = new Canvas({ width, height });
        const sprite1 = new Sprite({ width, height });
        const sprite2 = new Sprite({ width, height });
        const sprite3 = new Sprite({ width, height });

        // add first child

        canvas.addChild( sprite1 );

        expect( sprite1.last ).toBeNull();
        expect( sprite1.next ).toBeNull();

        // add second child

        canvas.addChild( sprite2 );

        expect( sprite1.last ).toBeNull();
        expect( sprite1.next ).toEqual( sprite2 );
        expect( sprite2.last ).toEqual( sprite1 );
        expect( sprite2.next ).toBeNull();

        // add third child

        canvas.addChild( sprite3 );

        expect( sprite1.last ).toBeNull();
        expect( sprite1.next ).toEqual( sprite2 );
        expect( sprite2.last ).toEqual( sprite1 );
        expect( sprite2.next ).toEqual( sprite3 );
        expect( sprite3.last ).toEqual( sprite2 );
        expect( sprite3.next ).toBeNull();
    });

    it( "should be able to update the linked list of its children", () => {
        const canvas  = new Canvas({ width, height });
        const sprite1 = new Sprite({ width, height });
        const sprite2 = new Sprite({ width, height });
        const sprite3 = new Sprite({ width, height });

        // add children

        canvas.addChild( sprite1 );
        canvas.addChild( sprite2 );
        canvas.addChild( sprite3 );

        // assert list is updated when middle child is removed

        canvas.removeChild( sprite2 );

        expect( sprite2.last ).toBeNull();
        expect( sprite2.next ).toBeNull();
        expect( sprite1.next ).toEqual( sprite3 );
        expect( sprite3.last ).toEqual( sprite1 );

        // remove last child

        canvas.removeChild( sprite3 );

        expect( sprite3.last ).toBeNull();
        expect( sprite3.next ).toBeNull();
        expect( sprite1.next ).toBeNull();
    });

    it( "should be able to return all lowest level children in its display list", () => {
        const canvas  = new Canvas({ width, height });
        const sprite1 = new Sprite({ width, height });
        const sprite2 = new Sprite({ width, height });

        expect( canvas.getChildren() instanceof Array ).toBe( true );
        expect( canvas.getChildren() ).toHaveLength( 0 );

        canvas.addChild( sprite1 );
        expect( canvas.getChildren() ).toHaveLength( 1 );
        expect( canvas.getChildren().indexOf( sprite1 ) ).toEqual( 0 );

        canvas.addChild( sprite2 );
        expect( canvas.getChildren() ).toHaveLength( 2 );
        expect( canvas.getChildren().indexOf( sprite2 ) ).toEqual( 1 );
    });

    it( "should be able to update its dimensions synchronously", () => {
        const canvas = new Canvas({ width, height });

        let newWidth  = width,
            newHeight = height;

        while ( newWidth === width )
            newWidth = Math.round( Math.random() * 1000 ) + 1;

        while ( newHeight === height )
            newHeight = Math.round( Math.random() * 1000 ) + 1;

        canvas.setDimensions( newWidth, newHeight, false, true );

        expect( canvas.getWidth() ).toEqual( newWidth );
        expect( canvas.getHeight() ).toEqual( newHeight );
    });

    it( "should be able to update its dimensions asynchronously on next render", done => {
        const canvas = new Canvas({ width, height });

        const oldWidth = width, oldHeight = height;

        let newWidth  = width,
            newHeight = height;

        while ( newWidth === width )
            newWidth = Math.round( Math.random() * 1000 ) + 1;

        while ( newHeight === height )
            newHeight = Math.round( Math.random() * 1000 ) + 1;

        canvas.setDimensions( newWidth, newHeight );

        // actual values should not have been updated yet

        expect( canvas._width ).toEqual( oldWidth );
        expect( canvas._height ).toEqual( oldHeight );

        // we do expect the getters to return the enqueued dimensions

        expect( canvas.getWidth() ).toEqual( newWidth );
        expect( canvas.getHeight() ).toEqual( newHeight );

        window.requestAnimationFrame(() => {
            expect( canvas.getWidth() ).toEqual( newWidth );
            expect( canvas._width ).toEqual( newWidth );
            expect( canvas.getHeight() ).toEqual( newHeight );
            expect( canvas._height ).toEqual( newHeight );

            done();
        });
    });

    it( "should know whether its animatable", () => {
        let canvas = new Canvas({ width, height, animate: false });
        expect( canvas.isAnimatable() ).toBe( false );

        canvas = new Canvas({ width, height, animate: true });
        expect( canvas.isAnimatable() ).toBe( true );
    });

    it( "should be able to toggle its animatable state", () => {
        const canvas = new Canvas({ width, height, animate: false });

        canvas.setAnimatable( true );
        expect( canvas.isAnimatable() ).toBe( true );

        canvas.setAnimatable( false );
        expect( canvas.isAnimatable() ).toBe( false );
    });

    it( "should continuously render on each animation frame when animatable", done => {
        const canvas = new Canvas({ width, height, animate: false });

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

    it( "should only render on invalidation when not animatable", done => {
        // construct as animatable
        const canvas = new Canvas({ width, height, animate: true });

        // now disable animation
        canvas.setAnimatable( false );

        // hijack bound render handlers

        const hijackedHandler = canvas._renderHandler;
        let renders = 0;

        canvas._renderHandler = () => {
            ++renders;
            hijackedHandler();
        };

        window.requestAnimationFrame( () => {
            // expected render count not to have incremented after disabling of animatable state
            expect( renders ).toEqual( 0 );

            canvas._renderHandler = () => done(); // hijack render to end test
            canvas.invalidate(); // call invalidate to render and end this test
        });
    });

    it( "should invoke a render upon invalidation request", done => {
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

    it( "should invoke the update()-method of its children upon render", done => {
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
        "update handler was configured", async done => {

        const handler = () => {
            setTimeout( () => done(), 10 );
        };
        const canvas = new Canvas({ width, height, animate: false, onUpdate: handler });
        const sprite = new Sprite({ width: 10, height: 10 });
        canvas.addChild( sprite );

        sprite.update = () => {
            throw new Error( "sprite update should not have been called" );
        };
        canvas.invalidate();
    });
});
