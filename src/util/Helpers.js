var util = util || {};

/* Disposable */

/**
 * a Disposable Object has an interface to clean up its
 * used resources by invoking the "dispose"-function prior
 * to destroying the object. The "disposeInternal"-method can
 * be overridden in your custom Disposable-extending Objects
 *
 * @see {goog.Disposable} (Google Closure library)
 */
util.Disposable = function()
{

};

/** @private @type {boolean} */ util.Disposable.prototype._disposed = false;

/**
 * method that will invoke the internal disposal method
 * which can be used to remove listeners, referenced Objects, etc.
 *
 * @public
 */
util.Disposable.prototype.dispose = function()
{
    if ( this._disposed ) {
        return;
    }
    this.disposeInternal();
    this._disposed = true;
};

/**
 * @protected
 */
util.Disposable.prototype.disposeInternal = function()
{
    // override in extending classes
};

/* EventHandler */

/**
 * EventHandler provides an interface to attach event listeners
 * to the DOM without having to worry about pesky cross browser implementations
 *
 * EventHandler inherits from the Disposable Object allowing it to clean up
 * all added listeners in one go by invoking dispose when the EventHandler is cleared
 *
 * @extends {util.Disposable}
 */
util.EventHandler = function()
{
    this._eventMappings = [];
};

util.EventHandler.prototype = new util.Disposable();

/** @private @type {Array.<Object>} */ util.EventHandler.prototype._eventMappings;

/**
 * attach a listener and an event handler to an element
 *
 * @param {Element} aElement
 * @param {string} aType
 * @param {!Function} aCallback
 *
 * @return {boolean} whether the listener has been attached successfully
 */
util.EventHandler.prototype.addEventListener = function( aElement, aType, aCallback )
{
    if ( !this.hasEventListener( aElement, aType ))
    {
        if ( aElement.addEventListener ) {
            aElement.addEventListener( aType, aCallback, false );
        }
        else if ( aElement.attachEvent ) {
            aElement.attachEvent( "on" + aType, aCallback );
        }
        else {
            return false;
        }
        this._eventMappings.push( { "element" : aElement, "type" : aType, "listener" : aCallback } );
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
 *
 * @return {boolean} whether the listener already exists
 */
util.EventHandler.prototype.hasEventListener = function( aElement, aType )
{
    var i = this._eventMappings.length;

    while ( i-- )
    {
        var theMapping = this._eventMappings[ i ];

        if ( theMapping.element == aElement && theMapping.type == aType )
        {
            return true;
        }
    }
    return false;
};

/**
 * remove a previously registered handler from an element
 *
 * @public
 *
 * @param {Element} aElement
 * @param {string} aType
 *
 * @return {boolean} whether the listener has been found and removed
 */
util.EventHandler.prototype.removeEventListener = function( aElement, aType )
{
    var i = this._eventMappings.length;

    while ( i-- )
    {
        var theMapping = this._eventMappings[ i ];

        if ( theMapping.element == aElement && theMapping.type == aType )
        {
            if ( aElement.removeEventListener ) {
                aElement.removeEventListener( aType, theMapping.listener, false );
            }
            else if ( aElement.detachEvent ) {
                aElement.detachEvent( "on" + aType, theMapping.listener );
            }
            else {
                return false;
            }
            this._eventMappings.splice( i, 1 );
            return true;
        }
    }
    return false;
};

/**
 * @override
 * @protected
 */
util.EventHandler.prototype.disposeInternal = function()
{
    var i = this._eventMappings.length;

    while ( i-- )
    {
        var mapping = this._eventMappings[ i ];
        this.removeEventListener( mapping.element, mapping.type );
    }
    this._eventMappings = null;
};

/* function binding */

/**
 * bind provides a method to execute a callback function
 * within the scope of a given Object
 *
 * @param {!Function} aFunction the function to execute
 * @param {*} aContext the scope the function should be executed in
 * @param {*=} aArguments optional multiple arguments
 *
 * @return {!Function} scoped function call
 */
util.bind = function( aFunction, aContext, aArguments )
{
    return function() {
      return aFunction.apply( aContext, arguments );
    };
};
