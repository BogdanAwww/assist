import config, {isProduction} from '@/server/config';
import URLParser from 'url';
import express from 'express';
import cors, {CorsOptions} from 'cors';

function checkOrigin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void): void {
	const url = URLParser.parse(origin || '');
	const domain = url.host || '';
	const configDomains = config.domain;
	const allowed = typeof configDomains === 'string' ? [configDomains] : configDomains;
	if (allowed.includes(domain) || !isProduction) {
		callback(null, true);
	} else {
		callback(new Error('Not allowed by CORS'));
	}
}

function corsOptionsDelegate(req: express.Request, callback: (err: Error | null, options?: CorsOptions) => void): void {
	const options: CorsOptions = {
		origin: checkOrigin,
		credentials: true
	};
	const secret = req.header('x-secret') || '';
	const configSecrets = config.corsSecret;
	const allowed = typeof configSecrets === 'string' ? [configSecrets] : configSecrets;
	if (allowed.includes(secret) || req.url.startsWith('/cloudpayments/')) {
		options.origin = undefined;
	}
	callback(null, options);
}

export default cors(corsOptionsDelegate);
