const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

function getJsLoaders(isReact = false) {
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
                        isReact ? {} : {
                            "pragma": "h",
                            "pragmaFrag": "'='",
                        }
                    ],
                ],
            }
        }
    ];
}

const configs = [];

const isDev = false;

fs.readdirSync('./src').map(pathname => {
    const extension = path.extname(pathname);  
    const basename = path.basename(pathname);
    const filename = basename.substring(0, basename.length - extension.length);

    configs.push({
        mode: isDev ? 'development' : 'production',
        entry: `./src/${filename}.js`,
        output: {
            path: path.resolve(__dirname, 'public/assets'),
            filename: `${filename}.js`
        },
        target: 'web',
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: getJsLoaders(filename.endsWith('_react'))
                },
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                __DEV__: isDev
            })
        ],
    });
});

module.exports = configs;
