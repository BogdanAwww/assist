import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import {getRelationUserById} from '@/server/schema/relations/user';
import {getRelationSpecialtiesByIds, getRelationSpecialtyById} from '@/server/schema/relations/specialty';
import {getRelationUploadById} from '@/server/schema/relations/upload';
import {getRelationProjectTypeById} from '../relations/project';
import {getLocaleResolver} from '@/server/utils/i18n-utils';

const schema = new Schema({
	author: {type: Schema.Types.ObjectId, ref: 'User'},
	title: String,
	title_en: String,
	description: String,
	description_en: String,
	link: String,
	attachment: {type: Schema.Types.ObjectId, ref: 'Upload'},
	thumbnail: String,
	iframe: String,
	type: String,
	specialty: {type: Schema.Types.ObjectId, ref: 'Specialty'},
	specialties: [{type: Schema.Types.ObjectId, ref: 'Specialty'}],
	responsibilities: String,
	responsibilities_en: String,
	participants: [
		{
			user: {type: Schema.Types.ObjectId, ref: 'User'},
			name: String,
			specialty: {type: Schema.Types.ObjectId, ref: 'Specialty'}
		}
	],
	views: {type: Number, default: () => 0}
});

export const PortfolioProjectModel = mongoose.model('PortfolioProject', schema);
export const PortfolioProjectTC = composeWithMongoose(PortfolioProjectModel);

PortfolioProjectTC.addFields({
	localeTitle: getLocaleResolver('title', 'title_en'),
	localeDescription: getLocaleResolver('description', 'description_en'),
	localeResponsibilities: getLocaleResolver('responsibilities', 'responsibilities_en'),
	author: () => getRelationUserById('author'),
	type: () => getRelationProjectTypeById('type'),
	specialty: () => getRelationSpecialtyById('specialty'),
	specialties: () => getRelationSpecialtiesByIds('specialties'),
	attachment: () => getRelationUploadById('attachment')
});

PortfolioProjectTC.addNestedFields({
	'participants.user': () => getRelationUserById('user'),
	'participants.specialty': () => getRelationSpecialtyById('specialty')
});
