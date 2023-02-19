import config from '../config';

function getHostUrl(path?: string): string {
	const additional = path || '';
	return `${config.protocol}://${config.domain}${additional}`;
}

function getApiUrl(): string {
	const port = config.port === 80 ? '' : ':' + config.port;
	const baseUrl = config.baseUrl || '';
	return getHostUrl() + port + baseUrl;
}

export {getHostUrl, getApiUrl};
