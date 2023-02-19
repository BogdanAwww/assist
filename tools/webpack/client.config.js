const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PostCssAssetsPlugin = require('postcss-assets-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const mqpacker = require('css-mqpacker');
const csso = require('postcss-csso');
const autoprefixer = require('autoprefixer');

const htmlRule = require('./rules/html');
const cssRule = require('./rules/css');
const tsxRule = require('./rules/client-tsx');
const fileRule = require('./rules/file');
const rawRule = require('./rules/raw');
const graphqlRule = require('./rules/graphql');
const nullRule = require('./rules/null');

const ENVIRONMENTS = [
    'development',
    'production',
    'staging',
    'beta'
];

const DEV_PORTS = {
    web: 8000,
    admin: 8001
};

const VERSION = require('./../../version.json').version;

const csp = [
    `default-src 'self';`,
    `connect-src 'self' data: blob: wss://assist.video wss://*.assist.video wss://*.hotjar.com assist.video *.assist.video *.sentry.io *.google-analytics.com *.google.com *.doubleclick.net youtube.com *.youtube.com vimeo.com *.vimeo.com hotjar.com *.hotjar.com;`,
    `frame-src 'self' data: assist.video *.assist.video rutube.ru *.rutube.ru youtube.com *.youtube.com *.vimeo.com *.soundcloud.com hotjar.com *.hotjar.com *.vk.com vk.com dropbox.com *.dropbox.com *.cloudpayments.ru;`,
    `img-src 'self' blob: data: assist.video *.assist.video assist.ams3.digitaloceanspaces.com *.google.com *.google.ru *.google.eu *.google.by *.google.co.uk *.rutube.ru *.userapi.com *.youtube.com *.vimeocdn.com *.ytimg.com gravatar.com *.gravatar.com *.mycdn.me *.cloudpayments.ru *.googletagmanager.com;`,
    `script-src 'self' 'unsafe-eval' 'unsafe-inline' assist.video *.assist.video www.googletagmanager.com *.cloudpayments.ru hotjar.com *.hotjar.com *.dropbox.com dropbox.com;`,
    `child-src 'self' blob:;`,
    `style-src 'self' 'unsafe-inline' assist.video *.assist.video fonts.googleapis.com;`,
    `font-src data: fonts.gstatic.com;`,
    `media-src data: assist.video *.assist.video;`
].join('');
const CSP_ENVS = ['staging', 'production'];

module.exports = (params) => {
    const {entry, chunkname, rootPath, environment, isProduction, browsers} = params;

    function getIndexHtmlPlugin(environment) {
        const config = require(path.resolve(process.cwd(), `./src/${entry}/config/config.${environment}.json`));
        const filenameSuffix = isProduction ? '.' + environment : '';

        return new HtmlWebPackPlugin({
            template: `./src/${entry}/index.html`,
            filename: `./index${filenameSuffix}.html`,
            inject: false,
            environment,
            config: {
                ...config,
                csp: CSP_ENVS.includes(environment) ? csp : undefined
            }
        });
    }

    const indexFiles = isProduction ? ENVIRONMENTS.map(getIndexHtmlPlugin) : [getIndexHtmlPlugin(environment)];

    const plugins = [
        ...indexFiles,
        new webpack.DefinePlugin({
            ENTRY: JSON.stringify(entry),
            IS_PRODUCTION: JSON.stringify(isProduction),
            VERSION: JSON.stringify(VERSION)
        })
    ];

    if (isProduction) {
        plugins.push(
            new MiniCssExtractPlugin({
                filename: `static/css/${chunkname}.css`,
                chunkFilename: `chunks/[name]/${chunkname}.css`
            }),
            new PostCssAssetsPlugin({
                log: false,
                plugins: [
                    autoprefixer({overrideBrowserslist: browsers}),
                    mqpacker(),
                    csso({restructure: false})
                ]
            }),
            new CompressionPlugin({
                include: /\.(css|js)/
            }),
            // new BundleAnalyzerPlugin()
        );
    }

    const envTest = ENVIRONMENTS
        .filter((env) => env !== environment)
        .map((env) => new RegExp(`src\\\/.*\\.${env}\\.`, 'gi'));

    return {
        // node: true,
        optimization: {
            removeAvailableModules: true,
            mergeDuplicateChunks: true,
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    terserOptions: {
                        output: {
                            comments: false
                        },
                        mangle: {
                            safari10: true
                        }
                    }
                })
            ],
            // splitChunks: {chunks: () => false},
            moduleIds: 'named',
            chunkIds: 'named'
        },
        module: {
            rules: [
                // htmlRule(params),
                cssRule(params),
                tsxRule(params, browsers),
                fileRule,
                rawRule,
                graphqlRule,
                // nullRule(envTest)
            ]
        },
        plugins,
        cache: {
            type: 'filesystem'
        },
        devServer: {
            contentBase: path.join(rootPath, `build/${entry}`),
            compress: true,
            host: 'localhost',
            port: DEV_PORTS[entry],
            historyApiFallback: true,
            disableHostCheck: true
        }
    };
};
