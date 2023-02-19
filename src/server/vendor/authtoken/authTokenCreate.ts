import {Context} from '@/server/modules/context';
import {AuthTokenModel} from '@/server/schema/entities/AuthTokenTC';
import {Schema} from 'mongoose';

export async function authTokenCreate(userId: Schema.Types.ObjectId, ctx: Context) {
	const user = ctx.auth.getUser();
	if (user) {
		return;
	}
	const token = ctx.auth.generateToken({_id: userId}, ctx);
	new AuthTokenModel({
		user: userId,
		token,
		ip: ctx.ip,
		useragent: ctx.useragent || ''
	}).save();
	return token;
}
