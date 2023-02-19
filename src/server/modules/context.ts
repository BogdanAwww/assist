import {ExpressContext} from 'apollo-server-express/dist/ApolloServer';
import express from 'express';
import Auth from './auth';

interface Context {
	lang: string;
	req: express.Request;
	vendorRequests: any[];
	ip?: string;
	useragent?: string;
	auth: Auth;
	isAdminApi?: boolean;
	showUserContacts?: boolean;
}

interface ContextOptions {
	isAdminApi?: boolean;
}

async function getContext({req, res}: ExpressContext, options: ContextOptions = {}): Promise<Context> {
	const lang = (req.headers['lang'] as string) || 'ru';
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	const ctx: Context = {
		req,
		lang,
		vendorRequests: [],
		ip: typeof ip === 'string' ? ip : undefined,
		useragent: req.get('user-agent'),
		auth: new Auth(req, res),
		isAdminApi: options.isAdminApi
	};

	await ctx.auth.authetiticate();

	return ctx;
}

export default getContext;
export {Context, ContextOptions};
