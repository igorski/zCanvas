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
export default class Cache {
    private _map: Map<string, ImageBitmap>;

    constructor() {
        this._map = new Map();
    }

    dispose(): void {
        const keys = [ ...this._map ].map(([ key ]) => key );
        while ( keys.length > 0 ) {
            this.remove( keys.shift() );
        }
        this._map = undefined;
    }

    get( key: string ): ImageBitmap | undefined {
        return this._map.get( key );
    }

    set( key: string, bitmap: ImageBitmap ): void {
        if ( this.has( key )) {
            const existingBitmap = this.get( key );
            if ( existingBitmap === bitmap ) {
                return;
            }
            this.remove( key );
        }
        this._map.set( key, bitmap );
    }

    has( key: string ): boolean {
        return this._map.has( key );
    }

    remove( key: string ): boolean {
        if ( !this.has( key )) {
            return false;
        }
        const bitmap = this.get( key );
        bitmap.close();

        return this._map.delete( key );
    }
}
