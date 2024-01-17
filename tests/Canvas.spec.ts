import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import "vitest-canvas-mock";
import Canvas from "../src/Canvas";
import Collision from "../src/Collision";
import Sprite from "../src/Sprite";
import RenderAPI from "../src/rendering/RenderAPI";
import { createMockImageBitmap, mockRequestAnimationFrame } from "./__mocks";

describe( "Canvas", () => {

    /* setup */

    let width: number;
    let height: number;
    let fps: number;

    // executed before each individual test

    beforeEach(() => {
        // generate random values
        width  = Math.round( Math.random() * 100 ) + 400;
        height = Math.round( Math.random() * 100 ) + 300;
        fps    = Math.round( Math.random() * 50 )  + 10;
   
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    /* actual unit tests */

    describe( "when constructing a new instance", () => {
        it( "should not construct with no or invalid dimensions specified", () => {
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

        it( "should return the provided construction arguments unchanged", () => {
            const canvas = new Canvas({
                width, height, fps, smoothing: false, animate: true,
            });
            expect( canvas.getWidth() ).toEqual( width );
            expect( canvas.getHeight() ).toEqual( height );
            expect( canvas.getFrameRate() ).toEqual( fps );
            expect( canvas.getSmoothing() ).toEqual( false );
            expect( canvas.isAnimatable() ).toEqual( true );
        });

        it( "should by default not have a Viewport", () => {
            const canvas = new Canvas();

            expect( canvas.getViewport()).toBeUndefined();
        });

        it( "should create a Viewport when provided", () => {
            const canvas = new Canvas({ viewport: { width: 200, height: 150 }});

            expect( canvas.getViewport()).toEqual({
                left: 0, top: 0, right: 200, bottom: 150, width: 200, height: 150
            });
        });

        it( "should automatically resize to its surroundings on construction", async () => {
            return new Promise( resolve => {
                new Canvas({ onResize: resolve });
            });
        });

        it( "should insert itself into DOM when a parent element is specified during construction", () => {
            const element = global.document.createElement( "div" );
            const canvas  = new Canvas({ parentElement: element });

            expect( canvas.getElement().parentNode ).toEqual( element );
        });

        it( "should create an instance of the RenderAPI upon construction", () => {
            const canvas = new Canvas();

            expect( canvas.getRenderer()).toBeInstanceOf( RenderAPI );
        });

        it( "should create an instance of the Collision API upon construction", () => {
            const canvas = new Canvas();

            expect( canvas.collision ).toBeInstanceOf( Collision );
        });

        it( "should by default add a listener to track window resize events", () => {
            const canvas = new Canvas();

            const resizeSpy = vi.spyOn( canvas, "setDimensions" );

            window.dispatchEvent( new Event( "resize", {} ));

            expect( resizeSpy ).toHaveBeenCalled();
        });

        it( "should not add a listener to track window resize events when autoSize is disabled", () => {
            const canvas = new Canvas({ autoSize: false });

            const resizeSpy = vi.spyOn( canvas, "setDimensions" );

            window.dispatchEvent( new Event( "resize", {} ));

            expect( resizeSpy ).not.toHaveBeenCalled();
        });
    });

    describe( "when acting as a mediator for the resource Cache", () => {
        it( "should forward loading a resource to the renderer", () => {
            vi.spyOn( RenderAPI.prototype, "loadResource" ).mockImplementation(() => Promise.resolve({ width: 100, height: 50 }) );

            const canvas = new Canvas();

            // @ts-expect-error snooping on a protected property
            const spy = vi.spyOn( canvas._rdr, "loadResource" );
            
            const bitmap = createMockImageBitmap();
            canvas.loadResource( "foo", bitmap );

            expect( spy ).toHaveBeenCalledWith( "foo", bitmap );
        });

        it( "should forward getting a resource to the renderer", () => {
            vi.spyOn( RenderAPI.prototype, "getResource" ).mockImplementation(() => Promise.resolve(createMockImageBitmap()) );

            const canvas = new Canvas();

            // @ts-expect-error snooping on a protected property
            const spy = vi.spyOn( canvas._rdr, "getResource" );
            
            canvas.getResource( "foo" );

            expect( spy ).toHaveBeenCalledWith( "foo" );
        });

        it( "should forward disposing a resource to the renderer", () => {
            vi.spyOn( RenderAPI.prototype, "disposeResource" ).mockImplementation(() => Promise.resolve() );

            const canvas = new Canvas();

            // @ts-expect-error snooping on a protected property
            const spy = vi.spyOn( canvas._rdr, "disposeResource" );
            
            canvas.disposeResource( "foo" );

            expect( spy ).toHaveBeenCalledWith( "foo" );
        });
    });

    describe( "when providing a way to get the currently visible content", () => {
        beforeEach(() => {
            vi.spyOn( CanvasRenderingContext2D.prototype, "drawImage" ).mockImplementation(() => vi.fn() );
        });

        it( "should by default clone the contents of the full size Canvas when no resourceId was provided", async () => {
            const canvas = new Canvas({ width: 1024, height: 768 });

            const getResourceSpy = vi.spyOn( RenderAPI.prototype, "getResource" );
            
            const content = await canvas.getContent();

            expect( content ).not.toEqual( canvas.getElement() );
            expect( getResourceSpy ).not.toHaveBeenCalled();
        });

        it( "should by default return a clone as big as itself", async () => {
            const canvas = new Canvas({ width: 1024, height: 768 });

            const content = await canvas.getContent();

            expect( content.width ).toEqual( 1024 );
            expect( content.height ).toEqual( 768 );
        });

        it( "should by request return a Canvas as big as the requested resource when a resourceId was provided", async () => {
            const canvas = new Canvas({ width: 1024, height: 768 });

            vi.spyOn( RenderAPI.prototype, "getResource" ).mockImplementation(() => Promise.resolve(createMockImageBitmap( 100, 50 )));
            
            const content = await canvas.getContent( "foo" );

            expect( content ).toBeInstanceOf( HTMLCanvasElement );
            
            expect( content.width ).toEqual( 100 );
            expect( content.height ).toEqual( 50 );
        });
    });

    it( "should be able to insert itself into the DOM at runtime", () => {
        const canvas  = new Canvas();
        const element = global.document.createElement( "div" );

        // expected canvas not to be attached to element prior to insertion
        expect( canvas.getElement().parentNode ).not.toEqual( element );

        canvas.insertInPage( element );

        // expected canvas to be inserted into given expected DOM element
        expect( canvas.getElement().parentNode ).toEqual( element );
    });

    it( "should add a reference to itself when adding a Sprite to its display list", () => {
        const canvas = new Canvas({ width, height });
        const child  = new Sprite({ width, height });
        
        canvas.addChild( child );

        expect( child.canvas ).toEqual( canvas ); // expected the child to reference the given canvas
    });
    
    it( "should be able to get and set a custom frame rate", () => {
        const canvas = new Canvas({ width, height });
        canvas.setFrameRate( 30 );
        expect( canvas.getFrameRate() ).toEqual( 30 );
    });

    it( "should be able to activate image smoothing on the Canvas' context", () => {
        const smoothingSpy = vi.spyOn( RenderAPI.prototype, "setSmoothing" );
        const canvas = new Canvas({ width, height, smoothing: true });
        
        expect( smoothingSpy ).toHaveBeenCalledWith( true );

        canvas.setSmoothing( false );

        expect( smoothingSpy ).toHaveBeenCalledWith( false );
    });

    it( "should be able to render crisp pixel art when image smoothing is disabled", () => {
        const canvas = new Canvas({ width, height, smoothing: true });

        expect( canvas.getElement().style[ "image-rendering" ]).toEqual( "" );

        canvas.setSmoothing( false );
        
        expect( canvas.getElement().style[ "image-rendering" ]).toEqual( "crisp-edges" );
    });

    describe( "when updating its dimensions", () => {
        it( "should be able to update its dimensions synchronously", () => {
            const canvas = new Canvas({ width, height });

            const newWidth  = width  + 1;
            const newHeight = height + 1;

            canvas.setDimensions( newWidth, newHeight, false, true );

            expect( canvas.getWidth() ).toEqual( newWidth );
            expect( canvas.getHeight() ).toEqual( newHeight );
        });

        it( "should update its bounding box accordingly", () => {
            const canvas = new Canvas({ width, height });

            const newWidth  = width  + 1;
            const newHeight = height + 1;

            expect( canvas.bbox ).toEqual({ left: 0, top: 0, right: width, bottom: height });
            
            canvas.setDimensions( newWidth, newHeight, false, true );

            expect( canvas.bbox ).toEqual({ left: 0, top: 0, right: newWidth, bottom: newHeight });
        });

        it( "should cache its dimensions upon request", () => {
            const canvas = new Canvas({ width, height });

            // @ts-expect-error protected property
            expect( canvas._coords ).toBeUndefined();

            canvas.getCoordinate();
            // @ts-expect-error protected property
            expect( canvas._coords ).not.toBeUndefined();

            // @ts-expect-error protected property
            expect( canvas.getCoordinate()).toEqual( canvas._coords );
        });

        it( "should invalidate the cached element coordinates", () => {
            const canvas = new Canvas({ width, height });
            canvas.getCoordinate(); // cache coordinates

            // @ts-expect-error protected property
            expect( canvas._coords ).not.toBeUndefined();

            const newWidth  = width + 1;
            const newHeight = height + 1;

            canvas.setDimensions( newWidth, newHeight, false, true );

            // @ts-expect-error protected property
            expect( canvas._coords ).toBeUndefined();
        });

        it( "should be able to update its dimensions asynchronously on next render", (): void => {
            mockRequestAnimationFrame();

            const canvas = new Canvas({ width, height });

            const oldWidth = width, oldHeight = height;

            const newWidth  = width  + 1;
            const newHeight = height + 1;

            canvas.setDimensions( newWidth, newHeight );

            // actual values should not have been updated yet

            // @ts-expect-error protected property
            expect( canvas._width ).toEqual( oldWidth );
            // @ts-expect-error protected property
            expect( canvas._height ).toEqual( oldHeight );

            vi.runAllTimers(); // advance RAF

            // we do expect the getters to return the enqueued dimensions

            expect( canvas.getWidth() ).toEqual( newWidth );
            expect( canvas.getHeight() ).toEqual( newHeight );

            expect( canvas.getWidth() ).toEqual( newWidth );
            // @ts-expect-error protected property
            expect( canvas._width ).toEqual( newWidth );
            expect( canvas.getHeight() ).toEqual( newHeight );
            // @ts-expect-error protected property
            expect( canvas._height ).toEqual( newHeight );
        });

        it( "should call the optionally provided resize handler once resizing has completed", () => {
            return new Promise( resolve => {
                const canvas = new Canvas({ width, height, onResize: resolve });

                const newWidth  = width + 1;
                const newHeight = height + 1;

                canvas.setDimensions( newWidth, newHeight );
            });
        });
    });

    describe( "when specifying an optional viewport", () => {
        it( "should be able to set its optional viewport and calculate its bounding box", () => {
            const canvas = new Canvas({ width, height });
            canvas.setViewport( 100, 50 );
            expect( canvas.getViewport() ).toEqual({
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
            expect( canvas.getViewport() ).toEqual({
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
            expect( canvas.getViewport() ).toEqual({
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
            expect( canvas.getViewport() ).toEqual({
                left: width - 100,
                top: height - 50,
                width: 100,
                height: 50,
                right: ( width - 100 ) + 100,
                bottom: ( height - 50 ) + 50
            });
        });

        it( "should by default not broadcast a change event to the optionally registered handler", () => {
            const viewportHandler = vi.fn();
            const canvas = new Canvas({ width, height, viewportHandler, viewport: { width: 100, height: 50 } });
            canvas.panViewport( width, height );
            expect( viewportHandler ).not.toHaveBeenCalled();
        });

        it( "should broadcast a change event to the optionally registered handler, when requested", () => {
            const viewportHandler = vi.fn();
            const canvas = new Canvas({ width, height, viewportHandler, viewport: { width: 100, height: 50 } });
            canvas.panViewport( width, height, true );
            expect( viewportHandler ).toHaveBeenCalled();
        });
    });

    describe( "when getting the canvas coordinates", () => {
        it( "should lazily retrieve the coordinates and cache the result", () => {
            const canvas  = new Canvas({ width, height });
            const gbcrSpy = vi.spyOn( canvas.getElement(), "getBoundingClientRect" );

            const coords = canvas.getCoordinate();
            expect( gbcrSpy ).toHaveBeenCalledTimes( 1 );

            const coords2 = canvas.getCoordinate();
            expect( coords2 ).toEqual( coords );
            expect( gbcrSpy ).toHaveBeenCalledTimes( 1 );
        });

        it( "should recalculate the coordinates when the cached result is cleared", () => {
            const canvas = new Canvas({ width, height });
            const gbcrSpy = vi.spyOn( canvas.getElement(), "getBoundingClientRect" ).mockImplementation(() => ({}));

            canvas.getCoordinate();
            // @ts-expect-error protected property
            canvas._coords = undefined;

            canvas.getCoordinate();

            expect( gbcrSpy ).toHaveBeenCalledTimes( 2 );
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

        it( "should invalidate the current contents even when stretch to fit isn't set", () => {
            const canvas = new Canvas({ width, height, stretchToFit: false });
            canvas.invalidate = vi.fn();
            canvas.scale( 2 );
            expect( canvas.invalidate ).toHaveBeenCalled();
        });
    });

    describe( "when stretching the canvas", () => {
        it( "it should be able to stretch itself to fit vertically inside its container", () => {
            // canvas will be portrait aspect ratio
            width  = 200;
            height = 300;

            // window will be landscape aspect ratio
            window.innerWidth  = 800;
            window.innerHeight = 600;

            const canvas = new Canvas({ width, height });
            canvas.stretchToFit( true );

            // ensure dominant size matches window size and other side
            // has used this same scale factor
            expect( canvas.getWidth() ).toEqual( window.innerWidth / window.innerHeight * height );
            expect( canvas.getHeight() ).toEqual( height );
        });

        it( "it should be able to stretch itself to fit horizontally inside its container", () => {
            // canvas will be landscape aspect ratio
            width  = 300;
            height = 200;

            // window will be portrait aspect ratio
            window.innerWidth  = 600;
            window.innerHeight = 800;

            const canvas = new Canvas({ width, height });
            canvas.stretchToFit( true );

            // ensure dominant size matches window size and other side
            // has used this same scale factor
            expect( canvas.getWidth() ).toEqual( width );
            expect( canvas.getHeight() ).toEqual( window.innerHeight / window.innerWidth * width );
        });

        it( "should not preserve the existing scale factor when stretching to fit inside its container", () => {
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
        });
    });

    describe( "when handling the render cycle", () => {
        let now: DOMHighResTimeStamp;

        beforeEach(() => { 
            now = window.performance.now();
            mockRequestAnimationFrame( now );
        });

        it( "should invoke a render upon invalidation request", (): Promise<void> => {
            return new Promise( resolve => {
                // hijack render method
                // @ts-expect-error snooping on a protected method
                const orgRender = vi.spyOn( Canvas.prototype, "render" ).mockImplementationOnce( resolve );

                const canvas = new Canvas({ animate: false });
                
                canvas.invalidate();
                
                vi.runAllTimers(); // advance RAF
            });
        });

        it( "should invoke the optionally provided updateHandler upon render", (): Promise<void> => {
            return new Promise( resolve => {
                const canvas = new Canvas({ animate: false , onUpdate: () => resolve() });
                
                canvas.invalidate();
                
                vi.runAllTimers(); // advance RAF
            });
        });

        it( "should keep track of the actual framerate", () => {
            const canvas = new Canvas({ animate: false, fps: 60 });

            // @ts-expect-error snooping on a protected method
            canvas.render( 0 ); // initial render

            // render a few seconds to get a good sample pool of rendered frames
            // where each render call had a slight deviation (see randomise)
            const actualFps = 50;
            for ( let i = 0, l = 5 * actualFps; i < l; ++i ) {
                // @ts-expect-error snooping on a protected method
                canvas.render( i * ( 1000 / actualFps ));
            }
            expect( Math.floor( canvas.getActualFrameRate() )).toEqual( actualFps );
        });

        it( "should invoke the update()-method of its children upon render", (): Promise<void> => {
            const canvas = new Canvas({ animate: false });
            const sprite = new Sprite({ width: 10, height: 10 });
            canvas.addChild( sprite );

            return new Promise( resolve => {
                sprite.update = ( timestamp, framesSinceLastUpdate ) => {
                    expect( typeof timestamp ).toBe( "number" );
                    expect( typeof framesSinceLastUpdate ).toBe( "number" );
                    resolve();
                };
                canvas.invalidate();

                vi.runAllTimers(); // advance RAF
            });
        });

        it( "should not invoke the update()-method of its children if a custom external " +
            "update handler was configured", (): Promise<void> => {

            return new Promise(( resolve, reject ) => {
                const customHandler = ( timestamp, framesSinceLastUpdate ) => {
                    expect( typeof timestamp ).toBe( "number" );
                    expect( typeof framesSinceLastUpdate ).toBe( "number" );
                    resolve();
                };
                const canvas = new Canvas({ width, height, animate: false, onUpdate: customHandler });
                const sprite = new Sprite({ width: 10, height: 10 });
                canvas.addChild( sprite );

                sprite.update = () => {
                    reject( new Error( "sprite update should not have been called" ));
                };
                canvas.invalidate();

                vi.runAllTimers(); // advance RAF
            });
        });

        it( "should defer actual rendering and calculate elapsed frames between render callbacks when a lower frame rate is specified", (): Promise<void> => {
            return new Promise(( resolve, reject ) => {
                let mayRender = false;

                const canvas = new Canvas({ fps: 10, onUpdate: ( timestamp, framesSinceLastRender ) => {
                    // if update handler is triggered we know rendering is executed when it shouldn't
                    if ( !mayRender ) {
                        reject( new Error( "render update handler should not have been called" ));
                    }

                    expect( timestamp ).toEqual( now + 100 );
                    // there were six render() invocations deferred into a single frame render
                    expect( Math.round( framesSinceLastRender )).toEqual( 1 );

                    resolve();
                }});
                // @ts-expect-error snooping on a protected property
                canvas._renderHandler = vi.fn(); // stub the RAF handler
                canvas.setAnimatable( true );
    
                // @ts-expect-error snooping on a protected property
                canvas._lastRender = now;

                // at 10 fps, we expect 100 ms frame durations (1000ms / 10fps)
                // as such the following invocations (at 1000ms / 60fps intervals)
                // will all have delta below 100 ms and should not trigger a render

                const incr = 1000 / 60;
                for ( let i = 1; i < 6; ++i ) {
                    // @ts-expect-error snooping on a protected property
                    canvas.render( now + ( i * incr ));
                }

                // the next (6th) render invocation is at a 100 ms delta relative
                // to last render, this should trigger the update handler

                mayRender = true;

                // @ts-expect-error protected property
                canvas.render( now + 100 );
            });
        });

        it( "should defer actual rendering and calculate elapsed frames between render callbacks when running in a high refresh rate environment", (): Promise<void> => {
            return new Promise(( resolve, reject ) => {
                let mayRender = false;
                
                // 60 fps being the norm
                const canvas = new Canvas({ fps: 60, onUpdate: ( timestamp, framesSinceLastRender ) => {
                    // if update handler is triggered we know rendering is executed when it shouldn't
                    if ( !mayRender ) {
                        reject( new Error( "render update handler should not have been called" ));
                    }
                    expect( timestamp ).toEqual( now + ( 1000 / 60 ));
                    // the deferred rendering should have capped the rendering to 60
                    // (thus we are progressing exactly one frame per render iteration
                    // we can disregard the skipped render)
                    expect( Math.round( framesSinceLastRender )).toEqual( 1 );

                    resolve();
                }});

                canvas.setAnimatable( true );
                // @ts-expect-error snooping on a protected property
                canvas._lastRender = now;

                // at 60 fps, we expect 16.66 ms frame intervals (1000ms / 60fps)
                // we will however run the RAF callbacks at 8.33 ms (1000ms / 120fps)
                // to emulate an Apple M1 120 Hz refresh rate

                const incr = 1000 / 120;

                // this first render should not trigger the update handler (not enough frames have elapsed)
                // @ts-expect-error snooping on protected property
                canvas.render( now + incr );

                // the next (2nd) render invocation is at a 16.66 ms delta relative
                // to last render, this should trigger the update handler
         
                mayRender = true;

                // @ts-expect-error protected property
                canvas.render( now + ( incr * 2 ));
            });
        });

        it( "should calculate the correct elapsed frames multiplier when the actual frame rate is lower than the configured frame rate due to a low refresh rate screen", (): Promise<void> => {
            return new Promise(( resolve, reject ) =>  {
                const canvas = new Canvas({ fps: 60, onUpdate: ( timestamp, framesSinceLastRender ) => {
                    expect( timestamp ).toEqual( now + ( 1000 / 50 ));
                    // as the environment manages less fps than the configured value, we
                    // should progress the update() by more frames
                    expect( framesSinceLastRender ).toEqual( 1.2 );
    
                    resolve();
                }});

                canvas.setAnimatable( true );
                // @ts-expect-error snooping on protected property
                canvas._lastRender = now;

                // at 60 fps, we expect 16.33 ms frame intervals (1000ms / 60fps)
                // we will however run the RAF callback at 20 ms (1000ms / 50fps)
                // to emulate a device with a lower refresh rate screen
    
                // @ts-expect-error snooping on protected property
                canvas.render( now + ( 1000 / 50 ));
            });
        });

        it( "should calculate the correct elapsed frames multiplier when the actual frame rate is lower than the configured high refresh rate", (): Promise<void> => {
            return new Promise(( resolve, reject ) =>  {
                const canvas = new Canvas({ fps: 120, onUpdate: ( timestamp, framesSinceLastRender ) => {
                    expect( timestamp ).toEqual( now + ( 1000 / 60 ));
                    // as the environment manages less fps than the configured value, we
                    // should progress the update() by more frames
                    expect( framesSinceLastRender ).toBeCloseTo( 2 );
    
                    resolve();
                }});

                canvas.setAnimatable( true );
                // @ts-expect-error snooping on protected property
                canvas._lastRender = now;

                // at 120 fps, we expect 8.33 ms frame intervals (1000ms / 120fps)
                // we will however run the RAF callback at 16.66 ms (1000ms / 60fps)
                // to emulate a device with a standardized refresh rate screen
    
                // @ts-expect-error snooping on protected property
                canvas.render( now + ( 1000 / 60 ));
            });
        });

        describe( "and dealing with the animatable state", () => {
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

            it( "should continuously render on each animation frame when animatable", (): Promise<void> => {
                let renders = 0;

                return new Promise( resolve => {
                    const onUpdate = vi.fn(() => {
                        if ( ++renders === 5 ) {
                            resolve();
                        }
                        vi.runAllTimers(); // advance RAF
                    });
                    const canvas = new Canvas({ animate: false, onUpdate });
                    canvas.setAnimatable( true );

                    vi.runAllTimers(); // advance RAF
                });
            });

            it( "should only render on invalidation when not animatable", (): Promise<void> => {
                let renders = 0;

                return new Promise( async resolve => {
                    const onUpdate = vi.fn(() => {
                        ++renders;
                    });
                    // construct as animatable
                    const canvas = new Canvas({ animate: true, onUpdate });
                    
                    // and disable animation
                    canvas.setAnimatable( false );
                    vi.runAllTimers(); // advance RAF, completes animation queued in constructor

                    renders = 0;

                    vi.runAllTimers(); // advance RAF

                    // expected render count not to have incremented as Canvas no longer animates
                    expect( renders ).toEqual( 0 );

                    onUpdate.mockImplementationOnce( resolve ); // hijack next render to end test
                    canvas.invalidate(); // call invalidate to render

                    vi.runAllTimers(); // advance RAF
                });
            });
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
                stopPropagation: vi.fn(),
                preventDefault: vi.fn(),
            };
        });

        it( "should invalidate the canvas content when events were handled for a non-animatable canvas", () => {
            const canvas = new Canvas({ width: 50, height: 50, animate: false });

            // note sprite is inside of event bounds
            canvas.addChild( new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true }));
            canvas.invalidate = vi.fn();
            // @ts-expect-error snooping on protected property
            canvas.handleInteraction( mockEvent );

            expect( canvas.invalidate ).toHaveBeenCalled();
        });

        it( "should not handle interactions of multiple sprites for a mouse event", () => {
            const canvas  = new Canvas({ width: 50, height: 50 });
            const sprite1 = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
            const sprite2 = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });

            const sprite1interactionSpy = vi.spyOn( sprite1, "handleInteraction" );
            const sprite2interactionSpy = vi.spyOn( sprite2, "handleInteraction" );

            canvas.addChild( sprite1 );
            canvas.addChild( sprite2 );
            // @ts-expect-error snooping on protected property
            canvas.handleInteraction( mockEvent );

            // note reverse order as events are handled first by sprites higher up in the display list
            expect( sprite2interactionSpy ).toHaveBeenCalled();
            expect( sprite1interactionSpy ).not.toHaveBeenCalled();
        });

        describe( "and the event is a touch event", () => {
            it( "should not handle interactions of multiple sprites for a touch event with a single touch", () => {
                mockEvent.type = "touchstart";
                mockEvent.changedTouches = [{ pageX: 10, pageY: 10 }];

                const canvas  = new Canvas({ width: 50, height: 50 });
                const sprite1 = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                const sprite2 = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });

                const sprite1interactionSpy = vi.spyOn( sprite1, "handleInteraction" );
                const sprite2interactionSpy = vi.spyOn( sprite2, "handleInteraction" );

                canvas.addChild( sprite1 );
                canvas.addChild( sprite2 );
                // @ts-expect-error snooping on protected property
                canvas.handleInteraction( mockEvent );

                // note reverse order as events are handled first by sprites higher up in the display list
                expect( sprite2interactionSpy ).toHaveBeenCalled();
                expect( sprite1interactionSpy ).not.toHaveBeenCalled();
            });

            it( "should handle interactions of multiple sprites for a touch event with a multiple touches", () => {
                mockEvent.type = "touchstart";
                mockEvent.changedTouches = [{ pageX: 10, pageY: 10 }, { pageX: 20, pageY: 20 }];

                const canvas  = new Canvas({ width: 50, height: 50 });
                const sprite1 = new Sprite({ x: 5,  y: 5,  width: 10, height: 10, interactive: true });
                const sprite2 = new Sprite({ x: 15, y: 15, width: 10, height: 10, interactive: true });

                const sprite1interactionSpy = vi.spyOn( sprite1, "handleInteraction" );
                const sprite2interactionSpy = vi.spyOn( sprite2, "handleInteraction" );

                canvas.addChild( sprite1 );
                canvas.addChild( sprite2 );
                // @ts-expect-error snooping on protected property
                canvas.handleInteraction( mockEvent );

                // note reverse order as events are handled first by sprites higher up in the display list
                expect( sprite2interactionSpy ).toHaveBeenCalled();
                expect( sprite1interactionSpy ).toHaveBeenCalled();
            });

            it( "should maintain a list of Sprites bound to a touch pointer for a touch event with a multiple touches", () => {
                mockEvent.type = "touchstart";
                mockEvent.changedTouches = [
                    { identifier: 0, pageX: 10, pageY: 10 },
                    { identifier: 1, pageX: 20, pageY: 20 }
                ];
                const canvas  = new Canvas({ width: 50, height: 50 });
                const sprite1 = new Sprite({ x: 5,  y: 5,  width: 10, height: 10, interactive: true });
                const sprite2 = new Sprite({ x: 15, y: 15, width: 10, height: 10, interactive: true });

                canvas.addChild( sprite1 );
                canvas.addChild( sprite2 );

                // @ts-expect-error snooping on protected property
                expect( canvas._aTchs ).toHaveLength( 0 );

                // @ts-expect-error snooping on protected property
                canvas.handleInteraction( mockEvent );

                // expect two sprites in the active touch list
                expect( canvas._aTchs ).toEqual([ sprite1, sprite2 ]);

                mockEvent.type = "touchmove";
                mockEvent.changedTouches = [
                    { identifier: 0, pageX: 13, pageY: 10 },
                    { identifier: 1, pageX: 20, pageY: 23 }
                ];
                // @ts-expect-error snooping on protected property
                canvas.handleInteraction( mockEvent );

                // expect touch list to remain unchanged on touch move event
                expect( canvas._aTchs ).toEqual([ sprite1, sprite2 ]);

                mockEvent.type = "touchend";
                mockEvent.changedTouches = [
                    { identifier: 1, pageX: 20, pageY: 23 }
                ];
                // @ts-expect-error snooping on protected property
                canvas.handleInteraction( mockEvent );

                // expect touch list to no longer contain sprite associated with removed pointer
                expect( canvas._aTchs ).toEqual([ sprite1, null ]);

                mockEvent.type = "touchstart";
                mockEvent.changedTouches = [
                    { identifier: 1, pageX: 20, pageY: 20 }
                ];
                // @ts-expect-error snooping on protected property
                canvas.handleInteraction( mockEvent );

                // expect touch list to have added sprite associated with added pointer
                expect( canvas._aTchs ).toEqual([ sprite1, sprite2 ]);

                mockEvent.type = "touchend";
                mockEvent.changedTouches = [
                    { identifier: 0, pageX: 13, pageY: 10 },
                    { identifier: 1, pageX: 20, pageY: 20 }
                ];
                // @ts-expect-error snooping on protected property
                canvas.handleInteraction( mockEvent );

                // expect touch list to no longer contain any mapped sprites
                expect( canvas._aTchs ).toEqual([ null, null ]);
            });

            it( "should not trigger a result when the position is out of event bounds", () => {
                mockEvent.type = "touchstart";
                mockEvent.changedTouches = [{ pageX: 5, pageY: 5 }];

                const canvas = new Canvas({ width: 50, height: 50 });
                const sprite = new Sprite({ x: 10, y: 10, width: 10, height: 10, interactive: true });

                const interactionSpy = vi.spyOn( sprite, "handleInteraction" );

                canvas.addChild( sprite );

                // @ts-expect-error snooping on protected property
                canvas.handleInteraction( mockEvent );

                expect( interactionSpy ).toHaveReturnedWith( false );

                mockEvent.changedTouches = [{ pageX: 10, pageY: 10 }];

                // @ts-expect-error snooping on protected property
                canvas.handleInteraction( mockEvent );

                expect( interactionSpy ).toHaveReturnedWith( true );
            });

            it( "should scale its coordinates appropriately when the Canvas is downscaled", () => {
                mockEvent.type = "touchstart";
                mockEvent.changedTouches = [{ pageX: 5, pageY: 5 }];

                const canvas = new Canvas({ width: 50, height: 50 });
                const sprite = new Sprite({ x: 10, y: 10, width: 10, height: 10, interactive: true });

                const interactionSpy = vi.spyOn( sprite, "handleInteraction" );

                canvas.addChild( sprite );
                canvas.scale( 0.5 );

                // @ts-expect-error snooping on protected property
                canvas.handleInteraction( mockEvent );

                expect( interactionSpy ).toHaveReturnedWith( true );
            });
        });
    });

    describe( "when disposing the Canvas instance", () => {
        it( "should remove all listeners", () => {
            const canvas = new Canvas();

            // @ts-expect-error snooping on a protected property
            const removeSpy = vi.spyOn( canvas._hdlr, "dispose" );

            canvas.dispose();

            expect( removeSpy ).toHaveBeenCalled();
        });

        it( "should remove itself from the DOM", () => {
            const element = global.document.createElement( "div" );
            const canvas  = new Canvas();

            canvas.insertInPage( element );
            expect( canvas.getElement().parentNode ).toEqual( element );

            canvas.dispose();
            expect( canvas.getElement().parentNode ).toBeNull();
        });

        it( "should dispose the renderer after a last animation frame so it can finish up", () => {
            mockRequestAnimationFrame();

            const canvas = new Canvas();
            const renderDisposeSpy = vi.spyOn( canvas.getRenderer() as RenderAPI, "dispose" );

            canvas.dispose();

            expect( renderDisposeSpy ).not.toHaveBeenCalled();

            vi.runAllTimers(); // advance RAF

            expect( renderDisposeSpy ).toHaveBeenCalled();
        });
    });
});
