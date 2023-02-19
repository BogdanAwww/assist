const babelHelpersDescription = require('@babel/helpers/package.json');

module.exports = ({isProduction, browsers}) => {
    const babelPlugins = [
        ['@babel/plugin-transform-runtime', {
            helpers: true,
            useESModules: true,
            version: babelHelpersDescription.version
        }],
        '@babel/plugin-transform-react-display-name',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-private-methods',
        '@babel/plugin-proposal-private-property-in-object',
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator',
        ['@babel/plugin-proposal-object-rest-spread', {useBuiltIns: true}],
        // require.resolve('babel-plugin-transform-commonjs-es2015-modules')
    ];
    if (isProduction) {
        babelPlugins.push([require.resolve('babel-plugin-transform-react-remove-prop-types'), {removeImport: true}]);
    }

    const loaders = [
        {
            loader: 'babel-loader',
            options: {
                comments: true,
                presets: [
                    '@babel/preset-react',
                    ['@babel/preset-env', {
                        modules: false,
                        loose: true,
                        exclude: ['transform-regenerator', 'transform-async-to-generator'],
                        targets: {browsers}
                    }]
                ],
                plugins: babelPlugins
            }
        },
        {
            loader: 'ts-loader',
            options: {transpileOnly: true}
        }
    ];

    return {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        use: loaders
    };
};
