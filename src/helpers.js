var helpers = {};   // create namespace

/* Disposable */

/**
* a Disposable Object has an interface to clean up its
* used resources by invoking the "dispose"-function prior
* to destroying the object. The "disposeInternal"-method can
* be overridden in your custom Disposable-extending Objects
*
* @see {goog.Disposable} (Google Closure library)
*/
helpers.Disposable = function()
{

};

/** @private @type {boolean} */ helpers.Disposable.prototype._disposed = false;

/**
* method that will invoke the internal disposal method
* which can be used to remove listeners, referenced Objects, etc.
* this method is not meant to be overridden
*
* @public
*/
helpers.Disposable.prototype.dispose = function()
{
    if ( this._disposed ) {
        return;
    }
    this.disposeInternal();
    this._disposed = true;
};

/**
* internal disposal method
* override to clean up listeners, recursively call
* disposal of referenced Disposable objects, etc.
*
* @protected
*/
helpers.Disposable.prototype.disposeInternal = function()
{
    // override in derived classes
};

/* EventHandler */

/**
* EventHandler provides an interface to attach event listeners
* to the DOM without having to worry about pesky cross browser implementations
*
* EventHandler inherits from the Disposable Object allowing it to clean up
* all added listeners in one go by invoking dispose when the EventHandler is cleared
*
* @extends {helpers.Disposable}
*/
helpers.EventHandler = function()
{
    this._eventMappings = [];
};

helpers.EventHandler.prototype = new helpers.Disposable();

/** @private @type {Array.<{ element: Element, type: string, listener: !Function}>} */ helpers.EventHandler.prototype._eventMappings;

/**
* attach a listener and an event handler to an element
*
* @param {Element} aElement
* @param {string} aType
* @param {!Function} aCallback
*
* @return {boolean} whether the listener has been attached successfully
*/
helpers.EventHandler.prototype.addEventListener = function( aElement, aType, aCallback )
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
helpers.EventHandler.prototype.hasEventListener = function( aElement, aType )
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
helpers.EventHandler.prototype.removeEventListener = function( aElement, aType )
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
helpers.EventHandler.prototype.disposeInternal = function()
{
    var i = this._eventMappings.length;

    while ( i-- )
    {
        var mapping = this._eventMappings[ i ];
        this.removeEventListener( mapping.element, mapping.type );
    }
    this._eventMappings = null;
};

/* prototype inheritance */

/**
* convenience method to inherit prototypes, this can be used to
* inherit in an OOP-style pattern, e.g. :
*
* extend( Bus, Vehicle ) will apply the properties of the Vehicle prototype onto
* the Bus prototype. As thus, creating a new instance of Bus will also provide all
* properties and methods of Vehicle
*
* adapted from source by The Closure Library Authors
*
* @param {!Function} aSubClass reference to the prototype that will inherit from superClass
* @param {!Function} aSuperClass reference to the prototype to inherit from
*/
helpers.extend = function( aSubClass, aSuperClass )
{
    function tempCtor() {}
    tempCtor.prototype = aSuperClass.prototype;
    aSubClass.superClass_ = aSuperClass.prototype;
    aSubClass.prototype = new tempCtor();
    aSubClass.prototype.constructor = aSubClass;

    /**
     * Calls superclass constructor/method.
     *
     * @param {!Object} aCaller Should always be "this".
     * @param {string} aMethodName The method name to call. Calling
     *     superclass constructor can be done with the special string
     *     'constructor'.
     * @param {...*} var_args The arguments to pass to superclass
     *     method/constructor.
     * @return {*} The return value of the superclass method/constructor.
     */
    aSubClass.super = function( aCaller, aMethodName, var_args ) {
      var args = new Array(arguments.length - 2);
      for (var i = 2; i < arguments.length; i++) {
        args[i - 2] = arguments[i];
      }
      return aSuperClass.prototype[aMethodName].apply(aCaller, args);
    };
};

// export module

(function( aName, aModule )
{
    // CommonJS
    if ( typeof module !== "undefined" )
        module.exports = aModule;

    // AMD
    else if ( typeof define === "function" && typeof define.amd === "object" )
        define( aName, function() { return aModule; });

    // Browser global
    else this[ aName ] = aModule;

}( "helpers", helpers ));
