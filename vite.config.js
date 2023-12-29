import { defineConfig } from "vite";
import { resolve } from "path";
import { terser } from "rollup-plugin-terser";

const dirLib    = `${__dirname}/node_modules`;
const dirSrc    = `${__dirname}/src`;
const dest      = `${__dirname}/dist`;

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        minify: "terser",
        lib: {
            entry: resolve( __dirname, "./zcanvas.ts" ),
            name: "zcanvas",
            formats: [ "es", "umd", "iife" ]
        },
        rollupOptions: { 
            plugins: [terser({
                format: {
                    comments: false,          
                },
            })],
        },
    },
    test: {
        environment : "jsdom",
    },
});
