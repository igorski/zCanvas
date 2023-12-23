import { describe, it, expect, beforeEach, vi } from "vitest";
import Canvas from "../src/Canvas";
import DisplayObject from "../src/DisplayObject";
import Sprite from "../src/Sprite";

describe( "DisplayObject", () => {
    let displayObject: DisplayObject<Sprite>;

    const width  = 300;
    const height = 100;
    
    beforeEach(() => {
        displayObject = new DisplayObject<Sprite>();
    });

    it( "should be able to add children to its display list", () => {
        const child = new Sprite({ width, height });

        expect( displayObject.contains( child )).toBe( false );
        
        displayObject.addChild( child );
        expect( displayObject.contains( child )).toBe( true );
        expect( child.getParent() ).toEqual( displayObject ); // expected the child to reference to given canvas

    });

    it( "should be able to remove children from its display list", () => {
        const child = new Sprite({ width, height });

        displayObject.addChild( child );
  
        const removed = displayObject.removeChild( child );

        expect( displayObject.contains( child )).toBe( false );
        expect( child.getParent() ).toBeUndefined();

        expect( removed ).toEqual( child ); // expected removed sprite to equal the requested sprite" );
    });

    it( "should unset the Canvas reference when removing a child from its display list", () => {
        const canvas = new Canvas({ width, height });
        const child = new Sprite({ width, height });

        displayObject.addChild( child );
        child.setCanvas( canvas );

        expect( child.canvas ).toEqual( canvas );

        displayObject.removeChild( child );

        expect( child.canvas ).toBeUndefined();
    });

    it( "should be able to keep count of the total children in its display list when adding new Sprites", () => {
        const child1 = new Sprite({ width, height });
        const child2 = new Sprite({ width, height });
 
        expect( displayObject.numChildren() ).toEqual( 0 );

        displayObject.addChild( child1 );

        expect( displayObject.numChildren() ).toEqual( 1 );

        displayObject.addChild( child2 );

        expect( displayObject.numChildren() ).toEqual( 2 );
    });

    it( "should be able to keep count of the total children in its display list when removing added Sprites", () => {
        const child1 = new Sprite({ width, height });
        const child2 = new Sprite({ width, height });

        displayObject.addChild( child1 );
        displayObject.addChild( child2 );
 
        displayObject.removeChild( child1 );

        expect( displayObject.numChildren() ).toEqual( 1 );

        displayObject.removeChild( child2 );

        expect( displayObject.numChildren() ).toEqual( 0 );
    });

    it( "should be able to retrieve children from specific indices in its display list", () => {
        const child1 = new Sprite({ width, height });
        const child2 = new Sprite({ width, height });
 
        displayObject.addChild( child1 );
        displayObject.addChild( child2 );
   
        expect( displayObject.getChildAt( 0 )).toEqual( child1 );
        expect( displayObject.getChildAt( 1 )).toEqual( child2 );
    });

    it( "should be able to remove children from specific indices in its display list", () => {
        const child1 = new Sprite({ width, height });
        const child2 = new Sprite({ width, height });
        const child3 = new Sprite({ width, height });

        displayObject.addChild( child1 );
        displayObject.addChild( child2 );
        displayObject.addChild( child3 );
  
        // test removals

        let removed = displayObject.removeChildAt( 2 );

        expect( displayObject.numChildren() ).toEqual ( 2 );
        expect( removed ).toEqual( child3 );

        removed = displayObject.removeChildAt( 0 );

        expect( displayObject.contains( child1 )).toBe( false );
        expect( displayObject.numChildren() ).toEqual ( 1 );
        expect( removed ).toEqual( child1 );

        removed = displayObject.removeChildAt( 0 );

        expect( displayObject.contains( child2 )).toBe( false );
        expect( displayObject.numChildren() ).toEqual ( 0 );
        expect( removed ).toEqual( child2 );
    });

    it( "should be able to return all children in its display list", () => {
        const sprite1 = new Sprite({ width, height });
        const sprite2 = new Sprite({ width, height });

        expect( displayObject.getChildren() ).toHaveLength( 0 );

        displayObject.addChild( sprite1 );
        displayObject.addChild( sprite2 );
    
        expect( displayObject.getChildren() ).toEqual([ sprite1, sprite2 ]);

        displayObject.removeChild( sprite1 );

        expect( displayObject.getChildren() ).toEqual([ sprite2 ]);
    });

    it("should not append the same child twice", () => {
        const sprite = new Sprite({ width: 10, height: 10 });

        expect( displayObject.numChildren() ).toEqual( 0 );

        displayObject.addChild( sprite );
        expect( displayObject.numChildren() ).toEqual( 1 );

        displayObject.addChild( sprite );
        expect( displayObject.numChildren() ).toEqual( 1 );
    });

    it( "should be able to maintain the linked list of its children", () => {
        const sprite1 = new Sprite({ width, height });
        const sprite2 = new Sprite({ width, height });
        const sprite3 = new Sprite({ width, height });

        // add first child

        displayObject.addChild( sprite1 );

        expect( sprite1.last ).toBeUndefined();
        expect( sprite1.next ).toBeUndefined();

        // add second child

        displayObject.addChild( sprite2 );

        expect( sprite1.last ).toBeUndefined();
        expect( sprite1.next ).toEqual( sprite2 );
        expect( sprite2.last ).toEqual( sprite1 );
        expect( sprite2.next ).toBeUndefined();

        // add third child

        displayObject.addChild( sprite3 );

        expect( sprite1.last ).toBeUndefined();
        expect( sprite1.next ).toEqual( sprite2 );
        expect( sprite2.last ).toEqual( sprite1 );
        expect( sprite2.next ).toEqual( sprite3 );
        expect( sprite3.last ).toEqual( sprite2 );
        expect( sprite3.next ).toBeUndefined();
    });

    it( "should be able to update the linked list of its children", () => {
        const sprite1 = new Sprite({ width, height });
        const sprite2 = new Sprite({ width, height });
        const sprite3 = new Sprite({ width, height });

        // add children

        displayObject.addChild( sprite1 );
        displayObject.addChild( sprite2 );
        displayObject.addChild( sprite3 );

        // assert list is updated when middle child is removed

        displayObject.removeChild( sprite2 );

        expect( sprite2.last ).toBeUndefined();
        expect( sprite2.next ).toBeUndefined();
        expect( sprite1.next ).toEqual( sprite3 );
        expect( sprite3.last ).toEqual( sprite1 );

        // remove last child

        displayObject.removeChild( sprite3 );

        expect( sprite3.last ).toBeUndefined();
        expect( sprite3.next ).toBeUndefined();
        expect( sprite1.next ).toBeUndefined();
    });

    it( "should request an invalidation of the display list when a child was added", () => {
        const invalidateSpy = vi.spyOn( displayObject, "invalidate" );

        displayObject.addChild( new Sprite({ width, height }));

        expect( invalidateSpy ).toHaveBeenCalled();
    });

    it( "should request an invalidation of the display list when a child was removed", () => {
        const sprite = new Sprite({ width, height });
        displayObject.addChild( sprite );

        const invalidateSpy = vi.spyOn( displayObject, "invalidate" );

        displayObject.removeChild( sprite );

        expect( invalidateSpy ).toHaveBeenCalled();
    });

    it( "should recursively dispose its children when dispose is invoked", () => {
        const sprite1 = new Sprite({ width, height });
        const sprite2 = new Sprite({ width, height });

        displayObject.addChild( sprite1 );
        displayObject.addChild( sprite2 );

        const sprite1DisposeSpy = vi.spyOn( sprite1, "dispose" );
        const sprite2DisposeSpy = vi.spyOn( sprite2, "dispose" );

        displayObject.dispose();

        expect( displayObject.numChildren() ).toEqual( 0 );

        expect( sprite1DisposeSpy ).toHaveBeenCalled();
        expect( sprite2DisposeSpy ).toHaveBeenCalled();
    });
});
