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
                            "pragmaFrag": "'='",
                        }
                    ],
                ],
            }
        }
    ];
}

const configs = [];

['differ', 'form', 'form_react', 'mount', 'mount_react', 'children', 'svg', 'svg_react', 'treecall', 'treecall_react', 'portal'].map(filename => {
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
