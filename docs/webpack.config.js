const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const postcssInitial = require('postcss-initial');

function getJsLoaders() {
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
                        {
                            "pragma": "jsx",
                            "pragmaFrag": "'['",
                        }
                    ],
                ],
            }
        }
    ];
}

function getLessLoaders() {
    return [
        {
            loader: 'style-loader',
            options: {
                injectType: 'singletonStyleTag'
            }
        },
        'css-loader',
        {
            loader: 'postcss-loader',
            options: {
                postcssOptions: {
                    plugins: [
                        autoprefixer(),
                        postcssInitial({reset: 'inherited'}),
                    ]
                }
            }
        },
        'less-loader',
    ];
}

const configs = [];

const isDev = process.env.NODE_ENV !== 'production';

fs.readdirSync('./src/pages').map(pathname => {
    const extension = path.extname(pathname);  
    const basename = path.basename(pathname);
    const filename = basename.substring(0, basename.length - extension.length);

    configs.push({
        mode: isDev ? 'development' : 'production',
        entry: `./src/pages/${filename}.js`,
        output: {
            path: path.resolve(__dirname, 'public/assets'),
            filename: `${filename}.js`
        },
        target: ['web', 'es5'],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: getJsLoaders()
                },
                {
                    test: /\.less$/,
                    use: getLessLoaders()
                },
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                __DEV__: isDev
            }),
            new HtmlWebpackPlugin({
                title: filename,
                filename: `../${filename}.html`,
                template: './src/template.html'
            }),
        ],
    });
});

module.exports = configs;
