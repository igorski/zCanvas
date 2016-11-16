/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2010-2016 Igor Zinken / igorski
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
"use strict";

const OOP = module.exports = {

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
    extend( aSubClass, aSuperClass ) {

        function TempConstructor() {}
        TempConstructor.prototype = aSuperClass.prototype;
        aSubClass.superClass_= aSuperClass.prototype;
        aSubClass.prototype = new TempConstructor();
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

            const args = new Array( arguments.length - 2 );
            for ( let i = 2; i < arguments.length; i++ )
                args[ i - 2 ] = arguments[ i ];

            return aSuperClass.prototype[ aMethodName ].apply( aCaller, args );
        };

        // ensure sub classes can also be extended indefinitely

        aSubClass.extend = function( anotherSubClass ) {
            OOP.extend( anotherSubClass, aSubClass )
        };
    }
};
