/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2023 - https://www.igorski.nl
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
export default class Cache<T> {
    private _map: Map<string, T>;

    // optional factory function in case entities can be lazily created inside this class

    private _createFn  : () => T | undefined;
    private _destroyFn : ( entity: T ) => void | undefined;
    private _index = 0;

    constructor( createFn?: () => T, destroyFn?: ( entity: T ) => void ) {
        this._map = new Map();

        this._createFn  = createFn;
        this._destroyFn = destroyFn;
    }

    dispose(): void {
        const keys = [ ...this._map ].map(([ key ]) => key );
        while ( keys.length > 0 ) {
            this.remove( keys.shift() );
        }
        this._map = undefined;
    }

    get( key: string ): T | undefined {
        return this._map.get( key );
    }

    set( key: string, entity: T ): void {
        if ( this.has( key )) {
            const existingEntity = this.get( key );
            if ( existingEntity === entity ) {
                return;
            }
            this.remove( key );
        }
        this._map.set( key, entity );
    }

    has( key: string ): boolean {
        return this._map.has( key );
    }

    remove( key: string ): boolean {
        if ( !this.has( key )) {
            return false;
        }
        const entity = this.get( key );
        this._destroyFn?.( entity );
        
        return this._map.delete( key );
    }

    // the following can be used when the Cache acts as a Pool
    // allowing you to retrieve the next available entity (or lazily create one)

    next(): T | undefined {
        let entity: T;
        const key = this._index.toString();

        if ( this.has( key )) {
            entity = this.get( key );
        } else if ( this._createFn ) {
            entity = this._createFn();
            this.set( key, entity );
        }
        ++this._index;
        return entity;
    }

    fill( amount: number ): void {
        const curIndex = this._index;
        for ( let i = 0; i < amount; ++i ) {
            this.next();
        }
        this._index = curIndex;
    }

    reset(): void {
        this._index = 0;
    }
}
