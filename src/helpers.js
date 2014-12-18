define( "helpers", function()
{
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
    helpers.bind = function( aFunction, aContext, aArguments )
    {
        return function() {
          return aFunction.apply( aContext, arguments );
        };
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
     * @param {!Function} subClass reference to the prototype that will inherit from superClass
     * @param {!Function} superClass reference to the prototype to inherit from
     */
    helpers.extend = function( subClass, superClass )
    {
        function ctor() {} // wrapper to act as a constructor

        ctor.prototype     = superClass.prototype;
        subClass.super     = superClass.prototype;
        subClass.prototype = new ctor();

        /** @override */
        subClass.prototype.constructor = subClass;
    };

    /**
     * convenience method to call the prototype constructor when instantiating
     * a function that has been extended (see helpers.extend), e.g. :
     *
     * helpers.super( this ); can be invoked from the child constructor to
     * apply the super class' constructor
     *
     * adapted from source by The Closure Library Authors
     *
     * @param {!Function} classInstance the instance of a child class calling this function
     * @param {string=} optMethodName optional, when null this invocation should act
     *                  as a super call from the constructor, when given it should match
     *                  a method name present on the prototype of the superclass
     * @param {...number} var_args optional arguments to pass to the super constructor
     */
    helpers.super = function( classInstance, optMethodName, var_args )
    {
        var caller = arguments.callee.caller;

        if ( caller.super ) {
            return caller.super.constructor.apply( classInstance,
                                                   Array.prototype.slice.call( arguments, 1 ));
        }

        var args = Array.prototype.slice.call( arguments, 2 ), foundCaller = false;

        for ( var ctor = classInstance.constructor; ctor;
              ctor = ctor.super && ctor.super.constructor )
        {
            if ( ctor.prototype[ optMethodName ] === caller )
                foundCaller = true;
            else if ( foundCaller )
                return ctor.prototype[ optMethodName ].apply( classInstance, args );
        }
    };

    return helpers;
});
