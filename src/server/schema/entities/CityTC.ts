import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import {getRelationCountryById} from '../relations/country';
import {Context} from '@/server/modules/context';

const schema = new Schema({
	geonameid: Number,
	name: String,
	latitude: Number,
	longitude: Number,
	country: {type: Schema.Types.ObjectId, ref: 'Country'},
	country_code: String,
	timezone: String,
	names: {type: Schema.Types.Map, of: String},
	fullNames: {type: Schema.Types.Map, of: String}
});

schema.index({'names.ru': 'text'}, {default_language: 'ru'});
schema.index({'names.en': 'text'}, {default_language: 'en'});

export const CityModel = mongoose.model('City', schema);
export const CityTC = composeWithMongoose(CityModel);

CityTC.addFields({
	localeName: {
		type: 'String',
		resolve: (source, _args, ctx: Context) => {
			return source.names.get(ctx.lang) || source.name;
		},
		projection: {names: 1}
	},
	localeFullName: {
		type: 'String',
		resolve: (source, _args, ctx: Context) => {
			return source.fullNames.get(ctx.lang) || source.name;
		},
		projection: {fullNames: 1}
	},
	country: () => getRelationCountryById('country')
});
