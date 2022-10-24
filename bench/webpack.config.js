const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')

function getJsLoaders(lib) {
    return [
        {
            loader: 'babel-loader',
            options: {
                presets: [
                    '@babel/preset-env',
                ],
                plugins: [
                    [
                        "@babel/plugin-transform-react-jsx",
                        lib === 'fiddlehead' ? {
                            'pragma': 'jsx',
                            'pragmaFrag': "'['",
                        } : {}
                    ],
                ],
            }
        }
    ];
}

const configs = [];

const isDev = process.env.NODE_ENV !== 'production';

fs.readdirSync('./src/tests').map(pathname => {
    const extension = path.extname(pathname);  
    const basename = path.basename(pathname);
    const filename = basename.substring(0, basename.length - extension.length);
    const lib = filename.split('_').pop();

    configs.push({
        mode: isDev ? 'development' : 'production',
        entry: `./src/tests/${filename}.js`,
        output: {
            path: path.resolve(__dirname, 'public/assets'),
            filename: `${filename}.js`
        },
        target: ['web', 'es5'],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: getJsLoaders(lib)
                },
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                __DEV__: isDev,
                __LIB__: `'${lib}'`,
            }),
            new HtmlWebpackPlugin({
                title: filename,
                filename: `../${filename}.html`,
                template: './src/template.html'
            })
        ],
    });
});

module.exports = configs;
