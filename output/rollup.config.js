import {terser} from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import {name as libraryName} from '../package.json';

export default ['core', 'store'].map((pkg) => ({
    input: `../packages/${pkg}/index.js`,
    external: pkg !== 'core' ? ['core.pkg'] : [],
    output: [
        {
            file: `../lib/${pkg}/${pkg}.development.js`,
            format: 'cjs',
            exports: 'named',
            plugins: [
                replace({
                    __DEV__: true,
                    'core.pkg': libraryName,
                }),
            ],
        },
        {
            file: `../lib/${pkg}/${pkg}.production.js`,
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
                    'core.pkg': libraryName,
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
