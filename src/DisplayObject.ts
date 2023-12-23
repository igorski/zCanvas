/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2013-2023 - https://www.igorski.nl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import type Canvas from "./Sprite";
import type Sprite from "./Sprite";

/**
 * A DisplayObject is an item that can visualise either itself or a list
 * of children onto a Canvas. It maintains a list of child Sprites.
 */
export default class DisplayObject<T> {
    protected _children: Sprite[] = [];
    protected _disposed = false;
    protected _parent: DisplayObject<Canvas | Sprite> | undefined;

    constructor() {}

    /* public methods */

    /**
     * @param {Sprite} child
     * @return {T} this Object for chaining purposes
     */
    addChild( child: Sprite ): DisplayObject<T> {
        if ( this.contains( child )) {
            return this;
        }
        // create a linked list
        const numChildren = this._children.length;

        if ( numChildren > 0 ) {
            child.last      = this._children[ numChildren - 1 ];
            child.last.next = child;
        }
        child.next = undefined;
        child.setParent( this );

        this._children.push( child );
        this.invalidate();

        return this;
    }

    /**
     * @param {Sprite} child the child to remove from this Canvas
     * @return {Sprite} the removed child - for chaining purposes
     */
    removeChild( child: Sprite ): Sprite {
        child.setParent( undefined );
        child.setCanvas( undefined );

        const childIndex = this._children.indexOf( child );
        
        if ( childIndex !== -1 ) {
            this._children.splice( childIndex, 1 );
        }

        // update linked list

        const prevChild = child.last;
        const nextChild = child.next;

        if ( prevChild ) {
            prevChild.next = nextChild;
        }
        if ( nextChild ) {
            nextChild.last = prevChild;
        }
        child.last = child.next = undefined;

        // request a render now the state of the canvas has changed

        this.invalidate();

        return child;
    }

    /**
     * retrieve a child of this Canvas by its index in the Display List
     * @param {number} index of the object in the Display List
     * @return {Sprite} the referenced object
     */
    getChildAt( index: number ): Sprite | undefined {
        return this._children[ index ];
    }

    /**
     * remove a child from this Canvas' Display List at the given index
     *
     * @param {number} index of the object to remove
     * @return {Sprite} the removed sprite
     */
    removeChildAt( index: number ): Sprite | undefined {
        return this.removeChild( this.getChildAt( index ));
    }

    /**
     * @return {number} the amount of children in this Canvas' Display List
     */
    numChildren(): number {
        return this._children.length;
    }

    getChildren(): Sprite[] {
        return this._children;
    }

    /**
     * check whether a given display object is present in this object's display list
     */
    contains( child: Sprite ): boolean {
        return child.getParent() === this;
    }

    /**
     * Whenever a change has occurred, this DisplayObject can request an
     * invalidation of the Canvas to ensure the on screen representation
     * matches the latest state.
     */
    invalidate(): void {
        // override in subclass
    }

    dispose(): void {
        this._disposed = true;

        // in case this Sprite was still on the canvas, remove it

        if ( this._parent ) {
            this._parent.removeChild( this as unknown as Sprite );
        }

        // dispose the children
        let i = this._children.length;

        while ( i-- ) {
            const theChild = this._children[ i ];
            theChild.dispose();
            // break references
            theChild.next = undefined;
            theChild.last = undefined;
        }
        this._children = [];
    }
}