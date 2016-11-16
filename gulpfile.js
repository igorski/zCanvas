const gulp        = require( "gulp" ),
      babel       = require( "gulp-babel" ),
      browserify  = require( "browserify" ),
      source      = require( "vinyl-source-stream" ),
      buffer      = require( "vinyl-buffer" ),
      concat      = require( "gulp-concat" ),
      rename      = require( "gulp-rename" ),
      uglify      = require( "gulp-uglify" ),
      amdOptimize = require( "amd-optimize" ),
      runSeq      = require( "run-sequence" ),
      del         = require( "del" );

const SRC_FOLDER      = "src";
const OUTPUT_FOLDER   = "dist";
const TEMP_FOLDER     = "temp";
const TEMP_ES5_FOLDER = "temp/es5";

/* tasks */

gulp.task("build", ( complete ) => {

    // builds both for AMD/RequireJS and globally scoped lib

    runSeq( "clean", [ "amd", "browser" ], complete );
});

gulp.task("amd", ["transpile-amd"], () => {

    return gulp.src( TEMP_ES5_FOLDER + "/**/*.js")
        .pipe( amdOptimize( "zcanvas.amd" ))
        .pipe( concat( "zcanvas.amd.js" ))
        .pipe( uglify() )
        .pipe( gulp.dest( OUTPUT_FOLDER ));
});

gulp.task("browser", ["browserify-commonjs"], () => {

    return gulp.src( TEMP_ES5_FOLDER + "/zcanvas.browser.js")
        .pipe( babel({ presets: "es2015" }))
        .pipe( concat( "zcanvas.min.js" ))
        .pipe( uglify() )
        .pipe( gulp.dest( OUTPUT_FOLDER ));
});

/* internal tasks */

/**
 * clean output folder
 */
gulp.task("clean", () => {

    return del([ OUTPUT_FOLDER, TEMP_FOLDER ]);
});

/**
 * copy the wrapper file that acts as the entry
 * point for the AMD/RequireJS output
 */
gulp.task("copy-amd-src", [], () => {

    return gulp.src([ SRC_FOLDER + "/**/*.js", "export/zcanvas.amd.js" ])
        .pipe( gulp.dest( TEMP_FOLDER ));
});

/**
 * copy the wrapper file that acts as the entry
 * point for direct browser usage
 */
gulp.task("copy-browser-src", [], () => {

    return gulp.src([ SRC_FOLDER + "/**/*.js", "export/zcanvas.browser.js" ])
        .pipe( gulp.dest( TEMP_FOLDER ));
});

/**
 * transform CommonJS modules into AMD/RequireJS format
 * while transpiling the ES6 to ES5 for browser usage
 */
gulp.task("transpile-amd", ["copy-amd-src"], () => {

    return gulp.src([ TEMP_FOLDER + "/**/*.js"])
        .pipe( babel({ presets: "es2015", plugins: "transform-es2015-modules-amd" }))
        .pipe( gulp.dest( TEMP_ES5_FOLDER ));
});

/**
 * transform CommonJS modules into globally scoped library
 */
gulp.task("browserify-commonjs", ["copy-browser-src"], () => {

    return browserify([ TEMP_FOLDER + "/zcanvas.browser.js" ])
        .bundle()
        .pipe( source( "zcanvas.browser.js" ))
        .pipe( gulp.dest( TEMP_ES5_FOLDER ));
});
