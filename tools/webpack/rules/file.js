module.exports = {
    test: /\.(svg|png|gif|jpeg|jpg|cur|ico|mp3)$/,
    exclude: /\.raw\.svg$/,
    use: [
        {
            loader: 'file-loader',
            options: {
                name: 'static/_/[hash].[ext]'
            }
        }
    ]
};
