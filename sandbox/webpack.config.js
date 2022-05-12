const path = require('path');

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
                            "pragmaFrag": "null"
                        }
                    ],
                ],
            }
        }
    ];
}

const configs = [];

['differ', 'form', 'mount', 'children', 'svg', 'mount_react'].map(filename => {
    configs.push({
        mode: 'production',
        entry: `./src/${filename}.js`,
        output: {
            path: path.resolve(__dirname, 'public'),
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
        }
    });
});

module.exports = configs;
