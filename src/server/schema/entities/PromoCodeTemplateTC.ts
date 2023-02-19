import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import {Context} from '@/server/modules/context';

const schema = new Schema({
	name: String,
	prefix: String,
	type: String,
	data: Schema.Types.Mixed,
	descriptions: {type: Schema.Types.Map, of: String}
});

export const PromoCodeTemplateModel = mongoose.model('PromoCodeTemplate', schema);
export const PromoCodeTemplateTC = composeWithMongoose(PromoCodeTemplateModel);

PromoCodeTemplateTC.removeField(['prefix', 'descriptions']);
PromoCodeTemplateTC.addFields({
	description: {
		type: 'String',
		resolve: (source, _args, ctx: Context) => {
			return source.descriptions.get(ctx.lang) || 'No description';
		},
		projection: {titles: 1}
	}
});
