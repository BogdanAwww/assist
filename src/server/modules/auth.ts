import passport from 'passport';
import express from 'express';
import cookieParser from 'cookie-parser';
import config from '@/server/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {Document} from 'mongoose';
import {Context} from './context';

const cookieParserHandler = cookieParser(config.cookieSecret);

const SALT_ROUNDS = 10;

class Auth {
	private _req: express.Request;
	private _res: express.Response;
	private _token?: string;

	constructor(req: express.Request, res: express.Response) {
		this._req = req;
		this._res = res;

		cookieParserHandler(req, res, () => {});
		this._token = this.getToken();
	}

	public getToken(): string | undefined {
		if (this._token) {
			return this._token;
		}
		const authHeader = this._req?.headers?.authorization || undefined;
		if (authHeader) {
			return authHeader.replace('Bearer ', '');
		}
		return this._req.signedCookies?.token || undefined;
	}

	public async authetiticate(): Promise<any> {
		return new Promise((resolve, reject) => {
			passport.authenticate('jwt', (err, user) => {
				if (err) {
					reject(err);
				} else {
					this._req.user = user;
					resolve(user);
				}
			})(this._req, this._res);
		});
	}

	public signToken(payload: any): string {
		return jwt.sign(payload, config.jwtSecret);
	}

	public generateToken(payload: any, ctx: Context): string {
		const token = this.signToken(payload);
		this._res.setHeader('token', token);
		if (!ctx.isAdminApi && config.cookieDomain) {
			this._res.cookie('token', token, {
				httpOnly: true,
				sameSite: true,
				domain: config.cookieDomain,
				signed: true
			});
		}
		return token;
	}

	public getUser(): Document | undefined {
		return (this._req.user as Document) || undefined;
	}

	public signout(): void {
		this._res.cookie('token', '', {expires: new Date()});
	}

	public static hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, SALT_ROUNDS);
	}

	public static comparePasswords(password: string, encrypted: string): Promise<boolean> {
		return bcrypt.compare(password, encrypted);
	}
}

async function deserializeToken(token: string): Promise<any> {
	return new Promise((resolve, reject) => {
		jwt.verify(token, config.jwtSecret, (err, data) => {
			if (data) {
				resolve(data);
			} else {
				reject(err);
			}
		});
	});
}

export default Auth;
export {deserializeToken};
