const path = require('path');

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
                            "pragma": "Hook.$",
                            "pragmaFrag": "null"
                        }
                    ],
                ],
            }
        }
    ];
}

const configs = [];

['form', 'mount'].map(filename => {
    configs.push({
        mode: 'development',
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
                    use: getJsLoaders()
                },
            ]
        }
    });
});

module.exports = configs;
