import {AuthTokenModel} from '@/server/schema/entities/AuthTokenTC';
import {Schema} from 'mongoose';

export function authTokenFindById(_id: Schema.Types.ObjectId) {
	return AuthTokenModel.findOne({_id});
}
