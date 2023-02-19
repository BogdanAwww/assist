const path = require('path');
const webpack = require('webpack');

const clientConfig = require('./tools/webpack/client.config');
const serverConfig = require('./tools/webpack/server.config');

const entry = process.env.ENTRY;
const isServerEntry = process.env.IS_SERVER_ENTRY;
const environment = process.env.NODE_ENV || 'development';
const isProduction = Boolean(process.env.PRODUCTION);
const mode = isProduction ? 'production' : 'development';
const chunkname = isProduction && !isServerEntry ? '[chunkhash]' : '[name]';

const params = {
	entry,
	chunkname,
	rootPath: __dirname,
	environment,
	isProduction,
	browsers: ['ie >= 11', 'Safari >= 6', 'Opera >= 15', 'Firefox >= 23', 'Android >= 4.4', 'Chrome >= 25']
};

const entryConfig = isServerEntry ? serverConfig : clientConfig;

if (!entry) {
	process.exit();
}

const baseConfig = {
	mode,
	context: __dirname,
	entry: {
		[entry]: `./src/${entry}/app`
	},
	output: {
		path: path.join(__dirname, `build/${entry}`),
		filename: `static/js/${chunkname}.js`,
		chunkFilename: `static/js/chunks/[name]/${chunkname}.js`,
		publicPath: ''
	},
	resolve: {
		modules: ['src', 'node_modules'],
		extensions: ['.js', '.ts', '.tsx'],
		alias: {
			'@': path.join(__dirname, 'src')
		}
	},
	stats: 'errors-only'
};

module.exports = {
	...baseConfig,
	...entryConfig(params)
};
