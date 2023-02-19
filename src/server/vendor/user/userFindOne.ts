import {Context} from '@/server/modules/context';
import {userHideFields, UserModel} from '@/server/schema/entities/UserTC';
import {Schema} from 'mongoose';

interface FilterOptions {
	_id?: Schema.Types.ObjectId;
	username?: string;
	email?: string;
	password?: string;
	_role?: string;
	$or?: any;
}

export async function userFindOne(filter: FilterOptions, ctx?: Context) {
	const query = UserModel.findOne(filter);
	if (ctx) {
		return query.then((user) => userHideFields(user, ctx));
	}
	return query;
}
