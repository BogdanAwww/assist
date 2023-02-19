import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';

const schema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	subject: {type: Schema.Types.ObjectId, ref: 'User'},
	isDeleted: Boolean
});

export const RecommendationModel = mongoose.model('Recommendation', schema);
export const RecommendationTC = composeWithMongoose(RecommendationModel);
