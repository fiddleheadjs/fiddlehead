const {terser} = require('rollup-plugin-terser');
const replace = require('@rollup/plugin-replace');
const {getBabelOutputPlugin} = require('@rollup/plugin-babel');
const {name: libraryName} = require('../package.json');

const configs = [];

['core', 'store'].forEach((pkg) => {
    ['cjs', 'esm'].forEach((moduleType) => {
        [false, true].forEach((supportsLegacy) => {
            [false, true].forEach((minifies) => {
                const __legacy = supportsLegacy ? '.legacy' : '';
                const __min = minifies ? '.min' : '';

                configs.push({
                    input: `../packages/${pkg}/index.js`,
                    external: pkg !== 'core' ? ['core.pkg'] : [],
                    output: [
                        {
                            file: `../lib/${pkg}/${moduleType}.development${__legacy}${__min}.js`,
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
                                minifies ? terser({
                                    compress: {
                                        module: true,
                                        keep_infinity: true,
                                        keep_fargs: false,
                                        inline: true,
                                    },
                                }) : null,
                            ],
                        },
                        {
                            file: `../lib/${pkg}/${moduleType}.production${__legacy}${__min}.js`,
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
                                minifies ? terser({
                                    compress: {
                                        module: true,
                                        keep_infinity: true,
                                        keep_fargs: false,
                                        inline: true,
                                    },
                                    mangle: {
                                        properties: {
                                            regex: /^[^_].*_$/,
                                        },
                                    },
                                }) : null,
                            ],
                        },
                    ]
                });
            });
        });
    });
});

module.exports = configs;
