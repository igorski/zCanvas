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
function EventHandler() {

    /* instance properties */

    /**
     * @private
     * @type {Array<{ element: Element, type: string, listener: !Function}>}
     */
    this._eventMappings = [];

    /**
     * @protected
     * @type {boolean}
     */
    this._disposed = false;
}
export default EventHandler;

const classPrototype = EventHandler.prototype;

/* public methods */

/**
 * attach a listener and an event handler to an element
 *
 * @param {Element} aElement
 * @param {string} aType
 * @param {!Function} aCallback *
 * @return {boolean} whether the listener has been attached successfully
 */
classPrototype.add = function( aElement, aType, aCallback ) {
    if ( !this.has( aElement, aType )) {
        aElement.addEventListener( aType, aCallback, false );
        this._eventMappings.push({
            element  : aElement,
            type     : aType,
            listener : aCallback
        });
        return true;
    }
    return false;
};

/**
 * query whether a listener for a specific event type has already
 * been registered for the given element
 *
 * @param {Element} aElement
 * @param {string} aType
 * @return {boolean} whether the listener already exists
 */
classPrototype.has = function( aElement, aType ) {
    let i = this._eventMappings.length;
    while ( i-- ) {
        const theMapping = this._eventMappings[ i ];
        if ( theMapping.element === aElement && theMapping.type == aType ) {
            return true;
        }
    }
    return false;
};

/**
 * remove a previously registered handler from an element
 *
 * @param {Element} aElement
 * @param {string} aType *
 * @return {boolean} whether the listener has been found and removed
 */
classPrototype.rem = function( aElement, aType ) {
    let i = this._eventMappings.length;
    while ( i-- ) {
        const theMapping = this._eventMappings[ i ];
        if ( theMapping.element === aElement && theMapping.type === aType ) {
            aElement.removeEventListener( aType, theMapping.listener, false );
            this._eventMappings.splice( i, 1 );
            return true;
        }
    }
    return false;
};

classPrototype.dispose = function() {
    if ( this._disposed ) {
        return;
    }
    this._disposed = true;

    let i = this._eventMappings.length;

    while ( i-- )  {
        const mapping = this._eventMappings[ i ];
        this.rem( mapping.element, mapping.type );
    }
    this._eventMappings = null;
};
