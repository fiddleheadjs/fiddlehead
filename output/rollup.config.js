import {terser} from 'rollup-plugin-terser';

export default {
    input: '../index.js',
    output: [
        {
            file: 'dist/index.js',
            format: 'cjs',
            exports: 'named',
        },
        {
            file: 'dist/index.min.js',
            format: 'cjs',
            plugins: [terser({
                mangle: {
                    properties: {
                        regex: /_$/,
                    },
                }
            })],
            exports: 'named',
        },
    ]
};
