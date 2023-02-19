const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (config) => {
    const loaders = [
        config.isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
        'css-loader',
        'postcss-loader'
    ];
    return {
        test: /\.css/,
        use: loaders
    };
};
