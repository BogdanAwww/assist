import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';

export const SubscriptionFields = {
	start: Number,
	end: Number,
	quota: {
		projects: Number,
		applications: Number,
		boosts: Number
	},
	level: {type: String, enum: ['start', 'basic', 'premium']},
	periods: [
		{
			start: Number,
			multiplier: Number,
			duration: {
				base: Number,
				bonus: Number,
				total: Number
			},
			quota: {
				projects: Number,
				applications: Number,
				boosts: Number
			}
		}
	]
};

const schema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	...SubscriptionFields
});

export const SubscriptionModel = mongoose.model('Subscription', schema);
export const SubscriptionTC = composeWithMongoose(SubscriptionModel);
