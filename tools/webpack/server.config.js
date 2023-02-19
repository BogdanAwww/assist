const nodeExternals = require('webpack-node-externals');

const cssRule = require('./rules/css');
const tsxRule = require('./rules/server-tsx');
const fileRule = require('./rules/file');
const rawRule = require('./rules/raw');

module.exports = (params) => {
    return {
        target: 'node',
        externals: [
            nodeExternals()
        ],
        optimization: {
            minimize: false
        },
        node: {
            __dirname: true
        },
        module: {
            rules: [
                tsxRule(),
                fileRule,
                rawRule
            ]
        },
        plugins: [],
    };
};