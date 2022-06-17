import {terser} from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';

export default ['core', 'store', 'memo'].map((pkg) => ({
    input: `../packages/${pkg}/index.js`,
    output: [
        {
            file: `../lib/${pkg}.development.js`,
            format: 'cjs',
            exports: 'named',
            plugins: [
                replace({
                    __DEV__: true,
                }),
            ]
        },
        {
            file: `../lib/${pkg}.production.js`,
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
}));
