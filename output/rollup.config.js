import {terser} from 'rollup-plugin-terser';

export default {
    input: '../src/index.js',
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
