const {terser} = require('rollup-plugin-terser');
const replace = require('@rollup/plugin-replace');
const {getBabelOutputPlugin} = require('@rollup/plugin-babel');
const {name: libraryName} = require('../package.json');

const configs = [];
['core'].forEach((pkg) => {
    ['cjs', 'esm'].forEach((moduleType) => {
        [false, true].forEach((supportsLegacy) => {
            const __legacy = supportsLegacy ? '.legacy' : '';
            
            configs.push({
                input: `../packages/${pkg}/index.js`,
                external: pkg !== 'core' ? ['core.pkg'] : [],
                output: [
                    {
                        file: `../lib/${pkg}/${moduleType}.development${__legacy}.js`,
                        format: moduleType,
                        exports: 'named',
                        plugins: [
                            replace({
                                __DEV__: true,
                                'core.pkg': libraryName,
                            }),
                            supportsLegacy ? getBabelOutputPlugin({
                                presets: ['@babel/preset-env'],
                            }) : null,
                        ],
                    },
                    {
                        file: `../lib/${pkg}/${moduleType}.production${__legacy}.js`,
                        format: moduleType,
                        exports: 'named',
                        plugins: [
                            replace({
                                __DEV__: false,
                                'core.pkg': libraryName,
                            }),
                            supportsLegacy ? getBabelOutputPlugin({
                                presets: ['@babel/preset-env'],
                            }) : null,
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
});

module.exports = configs;
