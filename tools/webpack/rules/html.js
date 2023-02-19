module.exports = (config) => {
    return {
        test: /\.html$/,
        use: [
            'html-loader'
        ]
    };
};
