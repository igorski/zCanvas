// resolve CommonJS dependencies

if ( typeof module !== "undefined" )
{
    var helpers = require( "./helpers" );
}

(function( aName, aModule )
{
    // CommonJS
    if ( typeof module !== "undefined" )
        module.exports = aModule();

    // AMD
    else if ( typeof define === "function" && typeof define.amd === "object" )
        define( aName, [ "helpers", "zSprite" ], function( helpers, zSprite ) { return aModule(); });

    // Browser global
    else this[ aName ] = aModule;

}( "zCanvas", function()
{
    // content here
    // return function definition
}
