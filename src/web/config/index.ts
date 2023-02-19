interface Config {
	env: 'staging' | 'development' | 'production' | 'beta';
	api: string;
	ws: string;
	baseUrl: string;
	dev?: boolean;
	facebookAppId?: string;
	cloudpaymentId?: string;
	gtag?: string;
}

const config: Config = (global as any).CONFIG;

export default config;
