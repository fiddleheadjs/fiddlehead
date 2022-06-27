const babelJest = require("babel-jest").default;

module.exports = babelJest.createTransformer({
    presets: ["@babel/preset-env"],
    plugins: [
        [
            "@babel/plugin-transform-react-jsx",
            {
                pragma: "jsx",
                pragmaFrag: "'['",
            },
        ]
    ],
    babelrc: false,
    configFile: false,
});
