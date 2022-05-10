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

['differ', 'form', 'mount', 'svg'].map(filename => {
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
