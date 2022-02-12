import Canvas from "../src/Canvas";
import Sprite from "../src/Sprite";
import Loader from "../src/Loader";

// stub the loader process
let mockLoadImage;
jest.mock('../src/Loader', () => ({
    loadImage: ( ...args ) => mockLoadImage( ...args )
}));
let mockMathFn;
jest.mock('../src/utils/image-math', () => ({
    isInsideViewport       : ( ...args ) => mockMathFn?.( "isInsideViewport", ...args ),
    calculateDrawRectangle : ( ...args ) => mockMathFn?.( "calculateDrawRectangle", ...args )
}));

describe( "zCanvas.sprite", () => {

    /* setup */

    let canvas, x, y, width, height, imgSource, imageElement, collidable, mask;

    // executed before the tests start running

    beforeAll( () => {
        // prepare Canvas
        canvas = new Canvas({ width: 200, height: 200 });

        mockLoadImage = async ( src, optImage ) => {
            const out  = optImage ? optImage : new window.Image();
            out.src    = src;
            out.width  = 1;
            out.height = 1;
            return {
                image: out,
                size: {
                    width: out.width,
                    height: out.height
                }
            };
        };
        // prepare 1x1 red PNG as Bitmap Image source
        imgSource = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP4z8DwHwAFAAH/VscvDQAAAABJRU5ErkJggg==";
        imageElement     = new window.Image();
        imageElement.src = imgSource;
    });

    // executed before each individual test

    beforeEach( () => {
        // generate random values for coordinates and dimensions
        x      = Math.round( Math.random() * 100 ) + 1;
        y      = Math.round( Math.random() * 100 ) + 1;
        width  = Math.round( Math.random() * 100 ) + 10;
        height = Math.round( Math.random() * 100 ) + 10;

        // random values for optional properties
        collidable = ( Math.random() > .5 );
        mask       = ( Math.random() > .5 );
    });

    // executed after each individual test

    afterEach( () => {
        while ( canvas.numChildren() > 0 ) {
            canvas.removeChildAt( 0 ).dispose();
        }
    });

    /* actual unit tests */

    it( "should construct with a single data Object", done => {
        const interactive = Math.random() > .5;
        const sprite = new Sprite({
            x, y, width, height, collidable, mask, interactive, bitmap: imgSource,
        });
        // setting of Bitmap is async
        window.requestAnimationFrame(() => {
            expect( sprite.getX() ).toEqual( x );
            expect( sprite.getY() ).toEqual( y );
            expect( sprite.getWidth() ).toEqual( width );
            expect( sprite.getHeight() ).toEqual( height );
            expect( sprite._bitmap.src ).toEqual( imgSource );
            expect( sprite.collidable ).toEqual( collidable );
            expect( sprite.getInteractive() ).toEqual( interactive );
            expect( sprite._mask ).toEqual( mask );
            done();
        });
    });

    it( "should not construct without valid dimensions specified", () => {
        expect(() => {
            new Sprite({ width: 0, height: 0 });
        }).toThrow( /cannot construct a zSprite without valid dimensions/ );

        expect(() => {
            new Sprite({ width: -1, height: -1 });
        }).toThrow( /cannot construct a zSprite without valid dimensions/ );

        expect(() => {
            new Sprite({ width: 10, height: 10 });
        }).not.toThrow();
    });

    it( "should not construct when providing an invalid Image type", () => {
        expect(() => {
            new Sprite({ width, height, bitmap: {} });
        }).toThrow( /expected HTMLImageElement, HTMLCanvasElement or String for Image source/ );

        expect(() => {
            new Sprite({ width, height, bitmap: imgSource });
        }).not.toThrow();
    });

    it( "should not construct with a spritesheet if no Bitmap was specified", () => {
        expect(() => {
            new Sprite({ width, height, sheet: [ {} ] });
        }).toThrow( /cannot use a spritesheet without a valid Bitmap/ );

        expect(() => {
            new Sprite({ width, height, bitmap: imgSource, sheet: [ {} ] });
        }).not.toThrow();
    });

    it( "should be able to extend its prototype into new function references", () => {
        const newClass = function() {};
        Sprite.extend( newClass );
        expect( new newClass() instanceof Sprite ).toBe( true );
    });

    it( "should by default construct for a 0, 0 coordinate", () => {
        const sprite = new Sprite({ width, height });

        expect( sprite.getX() ).toEqual( 0 );
        expect( sprite.getY() ).toEqual( 0 );
    });

    it( "should be able to toggle its draggable state", () => {
        const sprite = new Sprite({ width, height });

        expect( sprite.getDraggable() ).toBe( false );

        sprite.setDraggable( true );
        expect( sprite.getDraggable() ).toBe( true );
        expect( sprite.getInteractive() ).toBe( true );
        expect( sprite._keepInBounds ).toBe( false );

        sprite.setDraggable( false );
        expect( sprite.getDraggable() ).toBe( false );

        sprite.setDraggable( true, true );
        expect( sprite._keepInBounds ).toBe( true );
    });

    it( "should be able to toggle its interactive state", () => {
        const sprite = new Sprite({ width, height });
        expect( sprite.getInteractive() ).toBe( false );

        sprite.setInteractive( true );
        expect( sprite.getInteractive() ).toBe( true );

        sprite.setInteractive( false );
        expect( sprite.getInteractive() ).toBe( false );
    });

    it( "should be able to update its coordinates", () => {
        const sprite = new Sprite({ x, y, width, height });

        const newX = Math.round( Math.random() * 100 ) + 10;
        const newY = Math.round( Math.random() * 100 ) + 10;

        sprite.setX( newX );
        sprite.setY( newY );

        expect( sprite.getX() ).toEqual( newX );
        expect( sprite.getY() ).toEqual( newY );
    });

    it( "should be able to update its coordinates and its child coordinates recursively", () => {
        const sprite = new Sprite({ x, y, width, height });

        const child1X = Math.round( Math.random() * 100 ) + 10;
        const child1Y = Math.round( Math.random() * 100 ) + 10;
        const child2X = Math.round( Math.random() * 100 ) + 10;
        const child2Y = Math.round( Math.random() * 100 ) + 10;

        const child1  = new Sprite({
            x: child1X,
            y: child1Y,
            width, height
        });

        const child2 = new Sprite({
            x: child2X,
            y: child2Y,
            width, height
        });

        // add child1 onto parent, add child2 onto child1
        sprite.addChild( child1 );
        child1.addChild( child2 );

        const newX            = Math.round( Math.random() * 100 ) + 10;
        const newY            = Math.round( Math.random() * 100 ) + 10;
        const expectedChild1X = child1X + ( newX - sprite.getX() );
        const expectedChild1Y = child1Y + ( newY - sprite.getY() );
        const expectedChild2X = child2X + ( expectedChild1X - child1.getX() );
        const expectedChild2Y = child2Y + ( expectedChild1Y - child1.getY() );

        // update coordinates
        sprite.setX( newX );
        sprite.setY( newY );

        // evaluate child1 coordinates

        expect( child1.getX() ).toEqual( expectedChild1X );
        expect( child1.getY() ).toEqual( expectedChild1Y );
        expect( child2.getX() ).toEqual( expectedChild2X );
        expect( child2.getY() ).toEqual( expectedChild2Y );
    });

    it( "should have a bounds rectangle describing its offset and dimensions", () => {
        const sprite = new Sprite({ x, y, width, height });
        const bounds = sprite.getBounds();

        expect( bounds.left ).toEqual( x );
        expect( bounds.top ).toEqual( y );
        expect( bounds.width ).toEqual( width );
        expect( bounds.height ).toEqual( height );
    });

    it( "should invoke the update() method on its children recursively", () => {
        const expectedUpdates = 3;
        let updated = 0;

        // hijack update Function

        const orgUpdateFn = Sprite.prototype.update;
        Sprite.prototype.update = function() {
            ++updated;
            orgUpdateFn.call( this );
        };
        const sprite = new Sprite({ width, height });
        const child1 = new Sprite({ width, height });
        const child2 = new Sprite({ width, height });

        sprite.addChild( child1 );
        child1.addChild( child2 );

        // update

        sprite.update( 0 );

        // evaluate

        expect( updated ).toEqual( expectedUpdates );

        // restore update Function
        Sprite.prototype.update = orgUpdateFn;
    });

    it( "should be able to determine whether a coordinate is inside the sprites bounding box", () => {
        const sprite = new Sprite({ x, y, width, height });

        // top left
        expect( sprite.insideBounds( x - 1, y - 1 )).toBe( false );
        expect( sprite.insideBounds( x, y )).toBe( true );
        // top right
        expect( sprite.insideBounds( x + width + 1, y )).toBe( false );
        expect( sprite.insideBounds( x + width, y )).toBe( true );
        // bottom right
        expect( sprite.insideBounds( x + width, y + height + 1 )).toBe( false );
        expect( sprite.insideBounds( x + width, y + height )).toBe( true );
        // bottom left
        expect( sprite.insideBounds( x - 1, y + height )).toBe( false );
        expect( sprite.insideBounds( x, y + height )).toBe( true );
        // center
        expect( sprite.insideBounds( x + width / 2, y + height / 2 )).toBe( true );
    });

    it( "should be able to determine when it collides with another sprite", () => {
        const sprite = new Sprite({ x, y, width, height });

        const withinX = x + ( width  / 2 );
        const withinY = y + ( height / 2 );
        const outX    = x - width + 1;
        const outY    = y + height + 1;

        const spriteInBounds = new Sprite({
            x: withinX,
            y: withinY,
            width, height
        });

        const spriteOutOfBounds = new Sprite({
            x: outX,
            y: outY,
            width, height
        });

        expect( sprite.collidesWith( spriteInBounds )).toBe( true );
        expect( sprite.collidesWith( spriteOutOfBounds )).toBe( false );
    });

    it( "should be able to determine whether it collides with the edge of another sprite", () => {
        const sprite = new Sprite({ x, y, width, height });

        // expected sprite not collide with itself
        expect( sprite.collidesWithEdge( sprite )).toBe( false );

        const sprite2 = new Sprite({ x, y, width, height });
        canvas.addChild( sprite2 );

        expect(() => {
            sprite.collidesWithEdge( sprite2 );
        }).toThrow( /invalid argument for edge/ );

        // test left collision

        sprite2.setX( x + 1 );
        expect( sprite.collidesWithEdge( sprite2, 0 )).toBe( true );

        // test right collision

        sprite2.setX( x + width );
        expect( sprite.collidesWithEdge( sprite2, 2 )).toBe( true );

        // test top collision

        sprite2.setX( x );
        sprite2.setY( y + 1 );
        expect( sprite.collidesWithEdge( sprite2, 1 )).toBe( true );

        // test bottom collision

        sprite2.setY( y + height );
        expect( sprite.collidesWithEdge( sprite2, 3 )).toBe( true );
    });

    it( "should be able to set a parent Sprite", () => {
        const sprite = new Sprite({ x, y, width, height });
        const child = new Sprite({ x, y, width, height });

        expect( child.getParent() ).toBeNull();

        sprite.addChild( child );
        expect( child.getParent() ).toEqual( sprite );

        sprite.removeChild( child );
        expect( child.getParent() ).toBe( null );
    });

    // it doesn't, question is... SHOULD it?
    it.skip( "should by default set its constraints to the Canvas bounds", () => {
        const sprite = new Sprite({ x, y, width, height });
        canvas.addChild( sprite );

        const constraint = sprite.getConstraint();

        expect( constraint.left ).toEqual( 0 );
        expect( constraint.top ).toEqual( 0 );
        expect( constraint.width ).toEqual( canvas.getWidth() );
        expect( constraint.height ).toEqual( canvas.getHeight() );
    });

    it( "should be able to define parent constraints", () => {
        const sprite = new Sprite({ x, y, width, height });

        const cX      = x - width;
        const cY      = y + height;
        const cWidth  = Math.round( width / 2 );
        const cHeight = Math.round( height / 2 );

        expect( sprite._keepInBounds ).toBe( false );

        sprite.setConstraint( cX, cY, cWidth, cHeight );
        expect( sprite._keepInBounds ).toBe( true );

        const constraint = sprite.getConstraint();

        expect( constraint.left ).toEqual( cX );
        expect( constraint.top  ).toEqual( cY );
        expect( constraint.width ).toEqual( cWidth );
        expect( constraint.height ).toEqual( cHeight );
    });

    it( "should be able to add/remove children from its display list", () => {
        const sprite = new Sprite({ x, y, width, height });
        const child = new Sprite({ x, y, width, height });

        expect( sprite.contains( child ) ).toBe( false );

        sprite.addChild( child );
        expect( sprite.contains( child )).toBe( true );

        const removed = sprite.removeChild( child );
        expect( sprite.contains( child )).toBe( false );
        expect( removed ).toEqual( child );
    });

    it( "should be able to add/remove children from specific indices in its display list", () => {
        const sprite = new Sprite({ x, y, width, height });
        const child1 = new Sprite({ x, y, width, height });
        const child2 = new Sprite({ x, y, width, height });
        const child3 = new Sprite({ x, y, width, height });

        expect( sprite.numChildren() ).toEqual( 0 );

        sprite.addChild( child1 );
        expect( sprite.numChildren() ).toEqual( 1 );

        sprite.addChild( child2 );
        expect( sprite.numChildren() ).toEqual( 2 );
        expect( sprite.getChildAt( 0 )).toEqual( child1 );
        expect( sprite.getChildAt( 1 )).toEqual( child2 );

        sprite.addChild( child3 );
        expect( sprite.numChildren() ).toEqual( 3 );

        // test removals

        let removed = sprite.removeChildAt( 2 );

        expect( sprite.numChildren() ).toEqual( 2 );
        expect( removed ).toEqual( child3 );

        removed = sprite.removeChildAt( 0 );

        expect( sprite.contains( child1 ) ).toBe( false );
        expect( sprite.numChildren() ).toEqual( 1 );
        expect( removed ).toEqual( child1 );

        removed = sprite.removeChildAt( 0 );

        expect( sprite.contains( child2 )).toBe( false );
        expect( sprite.numChildren() ).toEqual( 0 );
        expect( removed ).toEqual( child2 );
    });

    it("should not append the same child twice", () => {
        const sprite = new Sprite({ width: 10, height: 10 });
        const child  = new Sprite({ width: 10, height: 10 });

        expect( sprite.numChildren() ).toEqual( 0 );

        sprite.addChild( child );
        expect( sprite.numChildren() ).toEqual( 1 );

        sprite.addChild( child );
        expect( sprite.numChildren() ).toEqual( 1 );
    });

    it( "should be able to maintain the linked list of its child sprites", () => {
        const canvas  = new Canvas({ width, height });
        const sprite1 = new Sprite({ width, height });
        const sprite2 = new Sprite({ width, height });
        const sprite3 = new Sprite({ width, height });

        expect( sprite1.next ).toBeNull();
        expect( sprite1.last ).toBeNull();

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

    it( "should be able to update the linked list of its child sprites", () => {
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

    // TODO: add setPosition test

    it( "should be able to update its bitmap", async () => {
        const sprite = new Sprite({ x, y, width, height });
        const newImage = imgSource;

        sprite._bitmapWidth  =
        sprite._bitmapHeight = 100;

        await sprite.setBitmap( newImage );

        expect( sprite._bitmap.src ).toEqual( newImage );
        expect( sprite._bitmapWidth ).toEqual( 1 );
        expect( sprite._bitmapHeight ).toEqual( 1 );

        sprite.setBitmap( null );
        expect( sprite._bitmap ).toBeNull();
    });

    it( "should by default keep its current size when updating Bitmaps", () => {
        const sprite = new Sprite({ x, y, width, height });

        sprite.setBitmap( imgSource );

        expect( sprite.getWidth() ).toEqual( width );
        expect( sprite.getHeight() ).toEqual( height );
    });

    it( "should be able to update its bitmap and size", () => {
        const sprite = new Sprite({ x, y, width, height });
        const newImage = imgSource;

        const newWidth = 10, newHeight = 10;

        sprite.setBitmap( newImage, newWidth, newHeight );

        expect( sprite.getWidth() ).toEqual( newWidth );
        expect( sprite.getHeight() ).toEqual( newHeight );
    });

    it( "should be able to update its width", () => {
        const sprite = new Sprite({ x, y, width, height, bitmap: imgSource });
        let newWidth = width;

        while ( width === newWidth ) {
            newWidth = Math.round( Math.random() * 1000 );
        }
        sprite.setWidth( newWidth );

        expect( sprite.getWidth() ).toEqual( newWidth );
    });

    it( "should be able to update its height", () => {
        const sprite = new Sprite({ x, y, width, height, bitmap: imgSource });
        let newHeight = height;

        while ( height === newHeight ) {
            newHeight = Math.round( Math.random() * 1000 );
        }
        sprite.setHeight( newHeight );

        expect( sprite.getHeight() ).toEqual( newHeight );
    });

    it( "should render its Bitmap in tiles when a spritesheet is defined", () => {
        const sheet = [
            { row: 0, col: 0, amount: 5, fpt: 5 }
        ];
        const sprite = new Sprite({ width, height, sheet, bitmap: imgSource });
        const aniProps = sprite._animation;
        const animation = sheet[ 0 ];

        expect( aniProps.col ).toEqual( animation.col );
        expect( aniProps.maxCol ).toEqual( animation.col + ( animation.amount - 1 ));
        expect( aniProps.fpt ).toEqual( animation.fpt );
        expect( aniProps.counter ).toEqual( 0 );

        for ( let i = 0; i < animation.fpt; ++i ) {
            sprite.update( Date.now() + i );

            if ( i < animation.fpt - 1 ) {
                 expect( aniProps.counter ).toEqual( i + 1 );
            } else {
                // expected counter to have reset after having met the max frames per tile
                expect( aniProps.counter ).toEqual( 0 );
            }
        }
        // expected column to have advanced after having met the max frames per tile
        expect( aniProps.col ).toEqual( 1 );

        aniProps.col = sheet.amount - 1;
        aniProps.counter = sheet.fpt - 1;

        sprite.update( Date.now() );

        // expected column to have jumped back to the first index after having played all tile frames
        //expect( aniProps.col ).toEqual( animation.col );
    });

    it( "should accept alternate dimensions for the spritesheet tiles", () => {
        const sheet = [
            { row: 0, col: 0, amount: 5, fpt: 5 }
        ];
        const tileWidth  = Math.round( Math.random() * 100 );
        const tileHeight = Math.round( Math.random() * 100 );
        const sprite = new Sprite({
            width, height, sheet, bitmap: imgSource,
            sheetTileWidth: tileWidth, sheetTileHeight: tileHeight
        });
        expect( sprite._animation.tileWidth ).toEqual( tileWidth );
        expect( sprite._animation.tileHeight ).toEqual( tileHeight );
    });

    it( "should fire an animation callback if a sheet animation has completed", done => {
        const sheet = [
            { row: 0, col: 0, amount: 5, fpt: 5, onComplete: spriteRef => {
                // expected animation complete handler to have returned reference to its calling Sprite
                expect( spriteRef ).toEqual( sprite );
                done();
            }}
        ];
        const sprite = new Sprite({ width, height, sheet, bitmap: imgSource });
        const animation = sheet[ 0 ];

        for ( let i = 0; i < animation.amount; ++i ) {
            for ( let j = 0; j < animation.fpt; ++j ) {
                sprite.update( Date.now() + i + j );
            }
        }
    });

    describe( "when handling events", () => {
        let mockEvent, sprite;
        beforeEach(() => {
            mockEvent = {
                type: "mousemove",
                changedTouches: [],
                offsetX: 10,
                offsetY: 10
            }
        });

        describe( "and the sprite is not interactive", () => {
            beforeEach(() => {
                mockEvent.type = "mousedown";
            });

            it( "should not handle anything", () => {
                const sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: false });
                const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                expect( handled ).toBe( false );
            });

            it( "except when it has interactive children", () => {
                const sprite = new Sprite({ x: 0, y: 0, width: 4, height: 4, interactive: false });
                sprite.addChild( new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true }));
                const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                expect( handled ).toBe( true );
            });
        });

        describe( "and the sprite is interactive", () => {
            it( "should set the hover state when moving over the sprite", () => {
                const sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                expect( sprite.hover ).toBe( false );
                const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                expect( sprite.hover ).toBe( true );
                expect( handled ).toBe( false ); // hovering does not stop event propagation
            });

            it( "should unset the hover state when moving out of a hovered sprite", () => {
                const sprite = new Sprite({ x: 15, y: 15, width: 10, height: 10, interactive: true });
                sprite.hover = true;
                const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                expect( sprite.hover ).toBe( false );
            });

            describe( "and pressing down on the sprite", () => {
                beforeEach(() => {
                    mockEvent.type = "mousedown";
                });

                it( "should call its handlePress handler", () => {
                    const sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                    jest.spyOn( sprite, "handlePress" );
                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( sprite.handlePress ).toHaveBeenCalledWith( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( handled ).toBe( true );
                });

                it( "should not allow dragging for non draggable sprites", () => {
                    const sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( sprite.isDragging ).toBe( false );
                    expect( handled ).toBe( true );
                });

                it( "should allow dragging for draggable sprites", () => {
                    const sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                    sprite.setDraggable( true );
                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( sprite.isDragging ).toBe( true );
                    expect( handled ).toBe( true );
                });
            });

            describe( "and moving over a down pressed sprite", () => {
                beforeEach(() => {
                    mockEvent.type = "mousemove";
                });

                it( "should not do anything for a non draggable sprite", () => {
                    const sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                    jest.spyOn( sprite, "handleMove" );
                    sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( sprite.handleMove ).not.toHaveBeenCalled();
                });

                it( "should call the move handler for a draggable sprite that is being dragged", () => {
                    const canvas = new Canvas({ width: 10, height: 10 });
                    const sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                    canvas.addChild( sprite );
                    jest.spyOn( sprite, "handleMove" );
                    sprite.setDraggable( true );
                    sprite.isDragging = true;
                    sprite._dragStartOffset = { x: sprite.getX(), y: sprite.getY() };
                    sprite._dragStartEventCoordinates = { x: mockEvent.offsetX, y: mockEvent.offsetY };
                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( sprite.handleMove ).toHaveBeenCalledWith( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( handled ).toBe( true );
                });
            });

            describe( "and releasing a down pressed sprite", () => {
                beforeEach(() => {
                    mockEvent.type = "mouseup";
                    // create sprite within mock event bounds and with down press state
                    sprite = new Sprite({ x: 5, y: 5, width: 10, height: 10, interactive: true });
                    sprite._pressed = true;

                    const canvas = new Canvas({ width: sprite.getWidth(), height: sprite.getHeight() });
                    canvas.addChild( sprite );
                });

                it( "should call its handleClick handler if the elapsed time between press and release was below 250 ms, along with handleRelease", () => {
                    sprite._pressTime = Date.now() - 249;
                    jest.spyOn( sprite, "handleClick" );
                    jest.spyOn( sprite, "handleRelease" );
                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( sprite.handleClick ).toHaveBeenCalled();
                    expect( sprite.handleRelease ).toHaveBeenCalled();
                    expect( handled ).toBe( true );
                });

                it( "should only call its handleRelease handler if the elapsed time between press and release was over 250 ms", () => {
                    sprite._pressTime = Date.now() - 250;
                    jest.spyOn( sprite, "handleRelease" );
                    jest.spyOn( sprite, "handleClick" );
                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( sprite.handleClick ).not.toHaveBeenCalled();
                    expect( sprite.handleRelease ).toHaveBeenCalled();
                    expect( handled ).toBe( true );
                });

                it( "should unset the dragging state for draggable Sprites", () => {
                    // set draggable sprite variables
                    sprite._dragStartOffset = { x: sprite.getX(), y: sprite.getY() };
                    sprite._dragStartEventCoordinates = { x: mockEvent.offsetX, y: mockEvent.offsetY };

                    sprite.setDraggable( true );
                    sprite.isDragging = true;
                    const handled = sprite.handleInteraction( mockEvent.offsetX, mockEvent.offsetY, mockEvent );
                    expect( sprite.isDragging ).toBe( false );
                    expect( handled ).toBe( true );
                });
            });
        });
    });

    describe( "when rendering its contents", () => {
        const canvas      = new Canvas();
        const sprite      = new Sprite({ x: 5, y: 5, width: 50, height: 50, bitmap: imageElement });
        const viewport    = { left: 10, top: 10, width: 100, height: 50, right: 110, bottom: 60 };

        canvas.addChild( sprite );
        let mockContext;

        beforeEach(() => {
            mockContext = { save: jest.fn(), restore: jest.fn(), drawImage: jest.fn() };
            sprite._bitmapReady = true;
        });

        it ( "should not draw when its bitmap is not ready", () => {
            sprite._bitmapReady = false;
            sprite.draw( mockContext, viewport );
            expect( mockContext.drawImage ).not.toHaveBeenCalled();
        });

        it( "should draw a when its bitmap is ready", () => {
            sprite.draw( mockContext );
            expect( mockContext.drawImage ).toHaveBeenCalledWith(
                sprite._bitmap,
                expect.any( Number ), expect.any( Number ), expect.any( Number ), expect.any( Number )
            );
        });

        describe( "and a viewport is passed", () => {
            it( "should perform a boundary check and not draw when the Sprite is outside of viewport bounds", () => {
                mockMathFn = jest.fn( fn => {
                    if ( fn === "isInsideViewport" ) {
                        return false;
                    }
                });
                sprite.draw( mockContext, viewport );
                expect( mockMathFn ).toHaveBeenCalledWith( "isInsideViewport", sprite.getBounds(), viewport );
                expect( mockContext.drawImage ).not.toHaveBeenCalled();
            });

            it( "should perform a boundary check and not draw when the Sprite is outside of viewport bounds", () => {
                mockMathFn = jest.fn( fn => {
                    if ( fn === "isInsideViewport" ) {
                        return true;
                    }
                    if ( fn === "calculateDrawRectangle" ) {
                        return {
                            src: { left: 1, top: 2, width: 3, height: 4 },
                            dest: { let: 5, top: 6, width: 7, height: 8 }
                        };
                    }
                });
                sprite.draw( mockContext, viewport );
                expect( mockMathFn ).toHaveBeenCalledWith( "isInsideViewport", sprite.getBounds(), viewport );
                expect( mockMathFn ).toHaveBeenCalledWith( "calculateDrawRectangle", sprite.getBounds(), viewport );
                expect( mockContext.drawImage ).toHaveBeenCalledWith(
                    sprite._bitmap,
                    expect.any( Number ), expect.any( Number ), expect.any( Number ), expect.any( Number ),
                    expect.any( Number ), expect.any( Number ), expect.any( Number ), expect.any( Number )
                );
            });
        });
    });
});
