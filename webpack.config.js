const path = require( 'path' );

const config = {
    entry: './zcanvas.js',
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /(node_modules)/,
                options: {
                    compact: true
                }
            }
        ]
    }
};

const browserConfig = {
    ...config,
    output: {
        filename: 'zcanvas.min.js',
        path: path.resolve( __dirname, 'dist' )
    }
};

const amdConfig = {
    ...config,
    output: {
        filename: 'zcanvas.amd.js',
        path: path.resolve( __dirname, 'dist' ),
        libraryTarget: 'amd',
        umdNamedDefine: true
    }
};

const moduleConfig = {
    ...config,
    output: {
        filename: 'zcanvas.js',
        path: path.resolve( __dirname, 'dist' ),
        libraryTarget: 'commonjs-module',
        umdNamedDefine: true
    }
};

module.exports = [
    browserConfig, amdConfig, moduleConfig
];
