import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import {Context} from '@/server/modules/context';

const schema = new Schema({
	code: String,
	name: String,
	names: {type: Schema.Types.Map, of: String}
});

schema.index({names: 'text'});

export const CountryModel = mongoose.model('Country', schema);
export const CountryTC = composeWithMongoose(CountryModel);

CountryTC.addFields({
	localeName: {
		type: 'String',
		resolve: (source, _args, ctx: Context) => {
			return source.names.get(ctx.lang) || source.name;
		},
		projection: {names: 1}
	}
});
