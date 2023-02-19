import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';

const schema = new Schema({
	token: String,
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	useragent: String,
	ip: String
});

export const AuthTokenModel = mongoose.model('AuthToken', schema);
export const AuthTokenTC = composeWithMongoose(AuthTokenModel);
