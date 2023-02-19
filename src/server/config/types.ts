type Environment = 'production' | 'development' | 'staging' | 'beta';

interface MongoDBReplicaConfig {
	host: string;
	port: number;
}

interface MongoDBConfig {
	username?: string;
	password?: string;
	host: string;
	port: number;
	database: string;
	replicas?: MongoDBReplicaConfig[];
}

interface RedisConfig {
	host: string;
	port: number;
	password?: string;
}

interface DOSpacesConfig {
	accessKeyId: string;
	secretAccessKey: string;
	endpoint: string;
	bucket: string;
}

interface MailgunConfig {
	apiKey: string;
	domain: string;
}

interface SocialAuthConfig {
	clientID: string;
	clientSecret: string;
	callbackURL: string;
}

interface CloudpaymentsConfig {
	id: string;
	secret: string;
}

interface GoogleTranslateConfig {
	keyId: string;
	key: string;
}

interface Config {
	protocol: string;
	domain: string;
	baseUrl: string;
	port: number;
	locale: string;
	cookieSecret: string;
	cookieDomain?: string;
	jwtSecret: string;
	corsSecret: string | string[];
	locales: string[];
	graphql: {
		maxComplexity: number;
	};
	db: MongoDBConfig;
	redis: RedisConfig;
	digitalOcean: {
		spaces: DOSpacesConfig;
	};
	mailgun: MailgunConfig;
	facebook: {
		auth: SocialAuthConfig;
	};
	google: {
		auth: SocialAuthConfig;
		translate: GoogleTranslateConfig;
	};
	cloudpayments: CloudpaymentsConfig;
}

export default Config;
export {Environment};
