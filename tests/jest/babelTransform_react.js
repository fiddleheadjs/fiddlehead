const babelJest = require("babel-jest").default;

module.exports = babelJest.createTransformer({
    presets: ["@babel/preset-env"],
    plugins: [
        ["@babel/plugin-transform-react-jsx"]
    ],
    babelrc: false,
    configFile: false,
});
