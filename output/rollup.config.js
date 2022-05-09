import {terser} from 'rollup-plugin-terser';

export default {
    input: '../index.js',
    output: {
        file: 'dist/index.min.js',
        format: 'cjs',
        plugins: [terser({
            mangle: {
                properties: true,
            }
        })],
        exports: 'named',
    }
};
