import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import generator from 'password-generator';

const schema = new Schema({
	hash: {type: String, default: () => generator(16, false)},
	email: String,
	author: {type: Schema.Types.ObjectId, ref: 'User'},
	status: {type: String, enum: ['active', 'accepted'], default: 'active'}
});

export const FriendInviteModel = mongoose.model('FriendInvite', schema);
export const FriendInviteTC = composeWithMongoose(FriendInviteModel);
