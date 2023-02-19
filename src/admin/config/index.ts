interface Config {
	api: string;
	baseUrl: string;
	domain?: string;
}

const config: Config = (global as any).CONFIG;

if (ENTRY === 'admin' && IS_PRODUCTION) {
	config.baseUrl = '/cc';
}

export default config;
