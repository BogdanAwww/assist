module.exports = {
    // parser: require('postcss-comment'),
    plugins: [
        require('@doctorwork/postcss-autoimport')({
            paths: [
                './src/common/styles/ui-variables.css',
                './src/common/styles/ui-mixins.css'
            ]
        }),
        require('postcss-import'),
        require('postcss-advanced-variables')({
            disable: '@import, @if, @else'
        }),
        // require('postcss-custom-properties')({
        //     preserve: config.customProperties,
        //     importFrom: './src/common/ui-colors/ui-colors.css'
        // }),
        require('postcss-automath'),
        require('postcss-nested'),
        require('./tools/postcss/hover')
        // require('postcss-inline-svg')
    ]
}