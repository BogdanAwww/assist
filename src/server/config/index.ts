import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Config, {Environment} from './types';

const environment = (process.env.NODE_ENV as Environment) || 'development';
const isDevEnv = environment === 'development' || environment === 'staging' || environment === 'beta';
const isProduction = environment === 'production';

console.log(`[ENV] ${environment}`);

const defaultEnvConfig = dotenv.config({
	path: path.resolve(__dirname, '.env')
});
const envConfig = {
	...defaultEnvConfig.parsed,
	...readEnvConfig(environment)
};

const config: Config = {
	protocol: envConfig.PROTOCOL || 'http',
	domain: envConfig.DOMAIN || 'localhost',
	baseUrl: envConfig.BASEURL || '',
	port: Number(process.env.APP_PORT) || parseInt(envConfig.PORT, 10) || 80,
	locale: 'ru',
	cookieSecret: envConfig.COOKIE_SECRET,
	cookieDomain: envConfig.COOKIE_DOMAIN,
	jwtSecret: envConfig.JWT_SECRET,
	corsSecret: envConfig.CORS_SECRET ? envConfig.CORS_SECRET.split(',') : [],
	locales: ['ru'],
	graphql: {
		maxComplexity: 500
	},
	db: {
		username: envConfig.DATABASE_USERNAME,
		password: envConfig.DATABASE_PASSWORD,
		host: envConfig.DATABASE_HOST,
		port: parseInt(envConfig.DATABASE_PORT, 10) || 27017,
		database: envConfig.DATABASE_NAME,
		replicas: envConfig.DATABASE_REPLICAS
			? envConfig.DATABASE_REPLICAS.split(',').map((host) => ({
					host,
					port: parseInt(envConfig.DATABASE_PORT, 10) || 27017
			  }))
			: undefined
	},
	redis: {
		host: envConfig.REDIS_HOST,
		port: parseInt(envConfig.REDIS_PORT, 10) || 6379,
		password: envConfig.REDIS_PASSWORD
	},
	digitalOcean: {
		spaces: {
			accessKeyId: envConfig.DO_SPACES_ACCESS_KEY,
			secretAccessKey: envConfig.DO_SPACES_SECRET_KEY,
			endpoint: envConfig.DO_SPACES_ENDPOINT,
			bucket: envConfig.DO_SPACES_BUCKET
		}
	},
	mailgun: {
		apiKey: envConfig.MAILGUN_KEY,
		domain: envConfig.MAILGUN_DOMAIN
	},
	facebook: {
		auth: {
			clientID: envConfig.FACEBOOK_APP_ID,
			clientSecret: envConfig.FACEBOOK_APP_SECRET,
			callbackURL: '/facebook/callback'
		}
	},
	google: {
		auth: {
			clientID: envConfig.GOOGLE_APP_ID,
			clientSecret: envConfig.GOOGLE_APP_SECRET,
			callbackURL: '/google/callback'
		},
		translate: {
			keyId: envConfig.GOOGLE_TRANSLATE_KEY_ID,
			key: envConfig.GOOGLE_TRANSLATE_KEY
		}
	},
	cloudpayments: {
		id: envConfig.CLOUDPAYMENTS_ID,
		secret: envConfig.CLOUDPAYMENTS_SECRET
	}
};

function readEnvConfig(environment: Environment): Record<string, string> {
	let rawConfig = '';
	try {
		rawConfig = process.env.ENV_CONFIG || fs.readFileSync(path.resolve(__dirname, `${environment}.env`), 'utf-8');
	} catch {
		rawConfig = '';
	}
	return rawConfig ? dotenv.parse(rawConfig) : {};
}

export default config;
export {environment, isDevEnv, isProduction};
