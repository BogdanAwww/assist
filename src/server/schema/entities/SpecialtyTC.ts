import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import {Context} from '@/server/modules/context';

const schema = new Schema({
	titles: {type: Schema.Types.Map, of: String},
	group: {type: Schema.Types.ObjectId, ref: 'SpecialtyGroup'},
	isFrequentlyUsed: Boolean
});

export const SpecialtyModel = mongoose.model('Specialty', schema);
export const SpecialtyTC = composeWithMongoose(SpecialtyModel);

SpecialtyTC.addFields({
	title: {
		type: 'String',
		resolve: (source, _args, ctx: Context) => {
			return source.titles.get(ctx.lang) || 'Unknown';
		},
		projection: {titles: 1}
	}
});
