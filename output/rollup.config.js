import {terser} from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';

export default {
    input: '../index.js',
    output: [
        {
            file: 'dist/index.development.js',
            format: 'cjs',
            exports: 'named',
            plugins: [
                replace({
                    __DEV__: true,
                }),
            ]
        },
        {
            file: 'dist/index.production.js',
            format: 'cjs',
            exports: 'named',
            generatedCode: {
                preset: 'es5',
                // TODO not working?
                arrowFunctions: false,
            },
            plugins: [
                replace({
                    __DEV__: false,
                }),
                terser({
                    compress: {
                        module: true,
                        booleans_as_integers: true,
                        keep_infinity: true,
                        keep_fargs: false,
                        inline: true,
                    },
                    mangle: {
                        properties: {
                            regex: /^[^_].*_$/,
                        },
                    },
                }),
            ],
        },
    ]
};
