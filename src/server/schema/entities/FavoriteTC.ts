import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import {getRelationFavoriteSubject} from '../relations/favorite';

const schema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	type: String,
	subject: Schema.Types.ObjectId,
	isDeleted: {type: Boolean, default: () => false},
	ts: {type: Number, default: () => new Date().getTime()}
});

export const FavoriteModel = mongoose.model('Favorite', schema);
export const FavoriteTC = composeWithMongoose(FavoriteModel);

FavoriteTC.addFields({
	subject: () => getRelationFavoriteSubject()
});
