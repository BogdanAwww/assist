module.exports = (params) => {
    const loaders = [
        {
            loader: 'babel-loader',
            options: {
                presets: [
                    '@babel/preset-react',
                    ['@babel/preset-env', {
                        // targets: {
                        //     node: '10.16'
                        // }
                    }]
                ],
                plugins: [
                    '@loadable/babel-plugin',
                    require.resolve('babel-plugin-dynamic-import-node-sync'),
                    '@babel/plugin-proposal-optional-chaining',
                    '@babel/plugin-proposal-nullish-coalescing-operator'
                ]
            }
        },
        {
            loader: 'ts-loader',
            options: {
                transpileOnly: true,
                compilerOptions: {
                    module: 'ESNext'
                }
            }
        }
    ];

    return {
        test: /\.tsx?$/,
        use: loaders
    };
};
