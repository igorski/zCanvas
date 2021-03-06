import Canvas from "../src/Canvas";
import Sprite from "../src/Sprite";

describe( "zCanvas.canvas", () => {

    /* setup */

    let width, height, fps, animate, smoothing;

    // executed before each individual test

    beforeEach( () => {
        // generate random values
        width     = Math.round( Math.random() * 100 ) + 400;
        height    = Math.round( Math.random() * 100 ) + 300;
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
        const scale = 2;
        const backgroundColor = '#FF00FF';
        const preventEventBubbling = Math.random() > .5;

        const canvas = new Canvas({
            width, height, fps, smoothing, animate,
            scale, backgroundColor, preventEventBubbling
        });
        expect( canvas.getWidth() ).toEqual( width );
        expect( canvas.getHeight() ).toEqual( height );
        expect( canvas.getFrameRate() ).toEqual( fps );
        expect( canvas._smoothing ).toEqual( smoothing );
        expect( canvas.isAnimatable() ).toEqual( animate );
        expect( canvas._scale.x ).toEqual( scale );
        expect( canvas._scale.y ).toEqual( scale );
        expect( canvas._bgColor ).toEqual( backgroundColor );
        expect( canvas._preventDefaults ).toEqual( preventEventBubbling );
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

    it( "should insert itself into DOM when a parent element is specified during construction", () => {
        const element = global.document.createElement( "div" );
        const canvas  = new Canvas({ parentElement: element });

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

    describe( "when updating its dimensions", () => {
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
    });

    describe( "when specifying an optional viewport", () => {
        it( "should be able to set its optional viewport and calculate its bounding box", () => {
            const canvas = new Canvas({ width, height });
            canvas.setViewport( 100, 50 );
            expect( canvas._viewport ).toEqual({
                left: 0,
                top: 0,
                width: 100,
                height: 50,
                right: 100,
                bottom: 50
            });
        });

        it( "should be able to pan the viewport and update its bounding box", () => {
            const canvas = new Canvas({ width, height });
            canvas.setViewport( 100, 50 );
            canvas.panViewport( 10, 20 );
            expect( canvas._viewport ).toEqual({
                left: 10,
                top: 20,
                width: 100,
                height: 50,
                right: 110,
                bottom: 70
            });
        });

        it( "should not allow negative panning of the viewport", () => {
            const canvas = new Canvas({ width, height, viewport: { width: 100, height: 50 } });
            canvas.panViewport( -50, -50 );
            expect( canvas._viewport ).toEqual({
                left: 0,
                top: 0,
                width: 100,
                height: 50,
                right: 100,
                bottom: 50
            });
        });

        it( "should not allow panning the viewport beyond the document bounds", () => {
            const canvas = new Canvas({ width, height, viewport: { width: 100, height: 50 } });
            canvas.panViewport( width, height );
            expect( canvas._viewport ).toEqual({
                left: width - 100,
                top: height - 50,
                width: 100,
                height: 50,
                right: ( width - 100 ) + 100,
                bottom: ( height - 50 ) + 50
            });
        });

        it( "should by default not broadcast a change event to the optionally registered handler", () => {
            const handler = jest.fn();
            const canvas = new Canvas({ width, height, handler, viewport: { width: 100, height: 50 } });
            canvas.panViewport( width, height );
            expect( handler ).not.toHaveBeenCalled();
        });

        it( "should broadcast a change event to the optionally registered handler, when requested", () => {
            const handler = jest.fn();
            const canvas = new Canvas({ width, height, handler, viewport: { width: 100, height: 50 } });
            canvas.panViewport( width, height, true );
            expect( handler ).toHaveBeenCalled();
        });
    });

    it( "should be able to activate image smoothing", () => {
        const canvas = new Canvas({ width, height, smoothing: false });
        expect( canvas.getElement().getContext( '2d' ).imageSmoothingEnabled ).toBe( false );
        canvas.setSmoothing( true );
        expect( canvas.getElement().getContext( '2d' ).imageSmoothingEnabled ).toBe( true );
    });

    it( "should be able to render crisp pixel art when image smoothing is disabled", () => {
        const canvas = new Canvas({ width, height, smoothing: true });
        expect( canvas.getElement() )?.style?.[ "image-rendering" ].toBeUndefined();
        canvas.setSmoothing( false );
        expect( canvas.getElement() )?.style?.[ "image-rendering" ].toEqual( "crisp-edges" );
    });

    describe( "when dealing with the animatable state", () => {
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

    describe( "when rendering", () => {
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

    describe( "when scaling the canvas", () => {
        it( "should be able to scale to the requested factor", () => {
            const canvas  = new Canvas({ width, height });
            const xFactor = 2;
            const yFactor = 3;

            canvas.scale( xFactor, yFactor );

            const { style } = canvas.getElement();

            // expected canvas dimensions to have remained the same
            expect( canvas.getWidth() ).toEqual( width );
            expect( canvas.getHeight() ).toEqual( height );

            // expected CSS transform to have applied scale
            expect( style.transform ).toEqual( `scale(${xFactor}, ${yFactor})` );
        });

        it( "should default the vertical scale factor to the horizontal, when not provided", () => {
            const canvas  = new Canvas({ width, height });
            const xFactor = 2;

            canvas.scale( xFactor );

            const { style } = canvas.getElement();
            expect( style.transform ).toEqual( `scale(${xFactor}, ${xFactor})` );
        });

        it( "should maintain the stretch to fit ratio when set", () => {
            const canvas = new Canvas({ width, height, stretchToFit: true });
            canvas.stretchToFit = jest.fn();
            canvas.scale( 2 );
            expect( canvas.stretchToFit ).toHaveBeenCalled();
        });

        it( "should invalidate the current contents even when stretch to fit isn't set", () => {
            const canvas = new Canvas({ width, height, stretchToFit: false });
            canvas.invalidate = jest.fn();
            canvas.scale( 2 );
            expect( canvas.invalidate ).toHaveBeenCalled();
        });
    });

    describe( "when stretching the canvas", () => {
        it( "should be able to stretch itself to fit vertically inside its container", () => {
            width  = 300;
            height = 200;

            const xFactor = 3;
            const yFactor = 1.5;

            window.innerWidth  = width * xFactor;
            window.innerHeight = height * yFactor;

            const canvas = new Canvas({ width, height });
            expect( canvas.getWidth() ).toEqual( width );
            expect( canvas.getHeight() ).toEqual( height );

            canvas.stretchToFit( true );
            expect( canvas.getWidth() ).toEqual( window.innerWidth );
            expect( canvas.getHeight() ).toEqual( window.innerHeight );
        });

        describe( "and maintaing the canvas aspect ratio", () => {
            it( "it should be able to stretch itself to fit vertically inside its container", () => {
                // canvas will be portrait aspect ratio
                width  = 200;
                height = 300;

                // window will be landscape aspect ratio
                window.innerWidth  = 800;
                window.innerHeight = 600;

                const canvas = new Canvas({ width, height });
                canvas.stretchToFit( true, true );

                // ensure dominant size matches window size and other side
                // has used this same scale factor
                expect( canvas.getWidth() ).toEqual( 400 );
                expect( canvas.getHeight() ).toEqual( 600 );
            });

            it( "it should be able to stretch itself to fit horizontally inside its container", () => {
                // canvas will be landscape aspect ratio
                width  = 300;
                height = 200;

                // window will be portrait aspect ratio
                window.innerWidth  = 600;
                window.innerHeight = 800;

                const canvas = new Canvas({ width, height });
                canvas.stretchToFit( true, true );

                // ensure dominant size matches window size and other side
                // has used this same scale factor
                expect( canvas.getWidth() ).toEqual( 600 );
                expect( canvas.getHeight() ).toEqual( 400 );
            });
        });

        it( "should preserve the existing scale factor when stretching to fit inside its container", () => {
            width  = 400;
            height = 300;

            const scale = 2;

            window.innerWidth  = 800;
            window.innerHeight = 600;

            const canvas = new Canvas({ width, height });
            canvas.scale( scale );
            canvas.stretchToFit( true );

            // ensure dimensions have maintained the same along with the scale factor
            expect( canvas.getWidth() ).toEqual( width );
            expect( canvas.getHeight() ).toEqual( height );
            expect( canvas.getElement().style.transform ).toEqual( `scale(${scale}, ${scale})` );

            // expand window size
            window.innerWidth  *= scale;
            window.innerHeight *= scale;

            canvas.stretchToFit( true );

            // ensure dimensions have scaled according to scale factor ratio
            expect( canvas.getWidth() ).toEqual( width * scale );
            expect( canvas.getHeight() ).toEqual( height * scale );
            expect( canvas.getElement().style.transform ).toEqual( `scale(${scale}, ${scale})` );
        });
    });

    describe( "when handling interaction events", () => {
        let mockEvent;
        beforeEach(() => {
            mockEvent = {
                type: "mousedown",
                changedTouches: [],
                offsetX: 10,
                offsetY: 10,
                stopPropagation: jest.fn(),
                preventDefault: jest.fn(),
            };
        });

        it( "should invalidate the canvas content when events were handled for a non-animatable canvas", () => {
            const canvas = new Canvas({ width: 50, height: 50, animate: false });

            // note sprite is inside of event bounds
            canvas.addChild( new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true }));
            canvas.invalidate = jest.fn();
            canvas.handleInteraction( mockEvent );

            expect(canvas.invalidate).toHaveBeenCalled();
        });

        it( "should not handle interactions of multiple sprites for a mouse event", () => {
            const canvas  = new Canvas({ width: 50, height: 50 });
            const sprite1 = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
            const sprite2 = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });

            jest.spyOn( sprite1, "handleInteraction" );
            jest.spyOn( sprite2, "handleInteraction" );

            canvas.addChild( sprite1 );
            canvas.addChild( sprite2 );
            canvas.handleInteraction( mockEvent );

            // note reverse order as events are handled first by sprites higher up in the display list
            expect(sprite2.handleInteraction).toHaveBeenCalled();
            expect(sprite1.handleInteraction).not.toHaveBeenCalled();
        });

        describe( "and the event is a touch event", () => {
            it( "should not handle interactions of multiple sprites for a touch event with a single touch", () => {
                mockEvent.type    = "touchstart";
                mockEvent.changedTouches = [{ pageX: 10, pageY: 10 }];

                const canvas  = new Canvas({ width: 50, height: 50 });
                const sprite1 = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                const sprite2 = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });

                jest.spyOn( sprite1, "handleInteraction" );
                jest.spyOn( sprite2, "handleInteraction" );

                canvas.addChild( sprite1 );
                canvas.addChild( sprite2 );
                canvas.handleInteraction( mockEvent );

                // note reverse order as events are handled first by sprites higher up in the display list
                expect( sprite2.handleInteraction ).toHaveBeenCalled();
                expect( sprite1.handleInteraction ).not.toHaveBeenCalled();
            });

            it( "should handle interactions of multiple sprites for a touch event with a multiple touches", () => {
                mockEvent.type    = "touchstart";
                mockEvent.changedTouches = [{ pageX: 10, pageY: 10 }, { pageX: 20, pageY: 20 }];

                const canvas  = new Canvas({ width: 50, height: 50 });
                const sprite1 = new Sprite({ x: 5,  y: 5,  width: 10, height: 10, interactive: true });
                const sprite2 = new Sprite({ x: 15, y: 15, width: 10, height: 10, interactive: true });

                jest.spyOn( sprite1, "handleInteraction" );
                jest.spyOn( sprite2, "handleInteraction" );

                canvas.addChild( sprite1 );
                canvas.addChild( sprite2 );
                canvas.handleInteraction( mockEvent );

                // note reverse order as events are handled first by sprites higher up in the display list
                expect( sprite2.handleInteraction ).toHaveBeenCalled();
                expect( sprite1.handleInteraction ).toHaveBeenCalled();
            });

            it( "should maintain a list of Sprites bound to a touch pointer for a touch event with a multiple touches", () => {
                mockEvent.type    = "touchstart";
                mockEvent.changedTouches = [
                    { identifier: 0, pageX: 10, pageY: 10 },
                    { identifier: 1, pageX: 20, pageY: 20 }
                ];
                const canvas  = new Canvas({ width: 50, height: 50 });
                const sprite1 = new Sprite({ x: 5,  y: 5,  width: 10, height: 10, interactive: true });
                const sprite2 = new Sprite({ x: 15, y: 15, width: 10, height: 10, interactive: true });

                canvas.addChild( sprite1 );
                canvas.addChild( sprite2 );

                // expect no active touches at construction
                expect( canvas._activeTouches ).toHaveLength( 0 );

                canvas.handleInteraction( mockEvent );

                // expect two sprites in the active touch list
                expect( canvas._activeTouches ).toEqual([ sprite1, sprite2 ]);

                mockEvent.type    = "touchmove";
                mockEvent.changedTouches = [
                    { identifier: 0, pageX: 13, pageY: 10 },
                    { identifier: 1, pageX: 20, pageY: 23 }
                ];
                canvas.handleInteraction( mockEvent );

                // expect touch list to remain unchanged on touch move event
                expect( canvas._activeTouches ).toEqual([ sprite1, sprite2 ]);

                mockEvent.type = "touchend";
                mockEvent.changedTouches = [
                    { identifier: 1, pageX: 20, pageY: 23 }
                ];
                canvas.handleInteraction( mockEvent );

                // expect touch list to no longer contain sprite associated with removed pointer
                expect( canvas._activeTouches ).toEqual([ sprite1, null ]);

                mockEvent.type = "touchstart";
                mockEvent.changedTouches = [
                    { identifier: 1, pageX: 20, pageY: 20 }
                ];
                canvas.handleInteraction( mockEvent );

                // expect touch list to have added sprite associated with added pointer
                expect( canvas._activeTouches ).toEqual([ sprite1, sprite2 ]);

                mockEvent.type = "touchend";
                mockEvent.changedTouches = [
                    { identifier: 0, pageX: 13, pageY: 10 },
                    { identifier: 1, pageX: 20, pageY: 20 }
                ];
                canvas.handleInteraction( mockEvent );

                // expect touch list to no longer contain any mapped sprites
                expect( canvas._activeTouches ).toEqual([ null, null ]);
            });
        });
    });

    describe( "when disposing the Canvas instance", () => {
        it( "should remove itself from the DOM", () => {
            const element = global.document.createElement( "div" );
            const canvas  = new Canvas({ width, height });

            canvas.insertInPage( element );
            expect( canvas.getElement().parentNode ).toEqual( element );
            canvas.dispose();
            expect( canvas.getElement().parentNode ).toBeNull();
        });
    });
});
