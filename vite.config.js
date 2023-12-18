import { defineConfig } from "vite";
import { resolve } from "path";

const dirLib    = `${__dirname}/node_modules`;
const dirSrc    = `${__dirname}/src`;
const dest      = `${__dirname}/dist`;

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: {
            entry: resolve( __dirname, "./zcanvas.ts" ),
            name: "zcanvas",
            formats: [ "es", "umd", "iife" ]
        },
    }
});
