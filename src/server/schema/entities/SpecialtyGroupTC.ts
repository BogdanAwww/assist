import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import {getRelationSpecialtiesByGroupId} from '../relations/specialty';
import {Context} from '@/server/modules/context';

const schema = new Schema({
	titles: {type: Schema.Types.Map, of: String}
});

export const SpecialtyGroupModel = mongoose.model('SpecialtyGroup', schema);
export const SpecialtyGroupTC = composeWithMongoose(SpecialtyGroupModel);

SpecialtyGroupTC.addFields({
	title: {
		type: 'String',
		resolve: (source, _args, ctx: Context) => {
			return source.titles.get(ctx.lang) || 'Unknown';
		},
		projection: {titles: 1}
	},
	specialties: () => getRelationSpecialtiesByGroupId('_id')
});
