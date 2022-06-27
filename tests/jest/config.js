const path = require('path');

module.exports = {
    globals: {
        "__DEV__": true
    },
    testEnvironment: 'jsdom',
    rootDir: path.resolve(__dirname,'./../../'),
    roots: [
        '<rootDir>/tests/src',
    ],
    collectCoverageFrom: [
        '<rootDir>/tests/src/**/*.test.{js,jsx,ts,tsx}',
    ],
    setupFiles: [],
    setupFilesAfterEnv: [
        '<rootDir>/tests/setupTests.js',
    ],
    testMatch: [
        '<rootDir>/tests/**/*.{spec,test}.{js,jsx,ts,tsx}',
    ],
    transform: {
        '^.+\\.(js|jsx|json)$': '<rootDir>/tests/jest/babelTransform.js',
    },
    transformIgnorePatterns: [
        '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
    ],
    modulePaths: [],
    moduleFileExtensions: [
        'js',
        'jsx',
        'json',
    ],
    resetMocks: true,
};
