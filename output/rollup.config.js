const {terser} = require('rollup-plugin-terser');
const replace = require('@rollup/plugin-replace');
const {name: libraryName} = require('../package.json');

const configs = [];
['core', 'store'].forEach((pkg) => {
    ['cjs', 'esm'].forEach((moduleType) => {
        configs.push({
            input: `../packages/${pkg}/index.js`,
            external: pkg !== 'core' ? ['core.pkg'] : [],
            output: [
                {
                    file: `../lib/${pkg}/${moduleType}.development.js`,
                    format: moduleType,
                    exports: 'named',
                    plugins: [
                        replace({
                            __DEV__: true,
                            'core.pkg': libraryName,
                        }),
                    ],
                },
                {
                    file: `../lib/${pkg}/${moduleType}.production.js`,
                    format: moduleType,
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
                                booleans_as_integers: false,
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
        });
    });
});

module.exports = configs;
