/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2010-2021 - https://www.igorski.nl
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
/**
 * EventHandler provides an interface to attach event listeners
 * to the DOM without having to worry about pesky cross browser implementations
 * additionally all added listeners can be cleared in one go by invoking dispose()
 * when the EventHandler is no longer required
 */
export default class EventHandler {

    private _eventMap: { target: EventTarget, type: string, listener: EventListenerOrEventListenerObject }[] = [];
    protected _disposed = false;

    constructor() {

    }

    /* public methods */

    /**
     * attach a listener and an event handler to an element
     *
     * @param {EventTarget} target
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} listener
     * @return {boolean} whether the listener has been attached successfully
     */
    add( target: EventTarget, type: string, listener: EventListenerOrEventListenerObject ): boolean {
        if ( this.has( target, type )) {
            return false;
        }
        target.addEventListener( type, listener, false );
        this._eventMap.push({ target, type, listener });
        
        return true;
    }

    /**
     * query whether a listener for a specific event type has already
     * been registered for the given element
     *
     * @param {EventTarget} target
     * @param {string} type
     * @return {boolean} whether the listener already exists
     */
    has( target: EventTarget, type: string ): boolean {
        let i = this._eventMap.length;
        while ( i-- ) {
            const theMapping = this._eventMap[ i ];
            if ( theMapping.target === target && theMapping.type == type ) {
                return true;
            }
        }
        return false;
    }

    /**
     * remove a previously registered handler from an element
     *
     * @param {EventTarget} target
     * @param {string} type
     * @return {boolean} whether the listener has been found and removed
     */
    remove( target: EventTarget, type: string ): boolean {
        let i = this._eventMap.length;
        while ( i-- ) {
            const theMapping = this._eventMap[ i ];
            if ( theMapping.target === target && theMapping.type === type ) {
                target.removeEventListener( type, theMapping.listener, false );
                this._eventMap.splice( i, 1 );
                return true;
            }
        }
        return false;
    }

    dispose(): void {
        if ( this._disposed ) {
            return;
        }
        let i = this._eventMap.length;

        while ( i-- )  {
            const mapping = this._eventMap[ i ];
            this.remove( mapping.target, mapping.type );
        }
        this._eventMap = null;
        this._disposed = true;
    }
}
