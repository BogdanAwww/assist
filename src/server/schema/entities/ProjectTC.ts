import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import {getRelationUserById} from '@/server/schema/relations/user';
import {getRelationCityById} from '@/server/schema/relations/city';
import {getRelationSpecialtiesByIds} from '@/server/schema/relations/specialty';
import {getRelationUploadById} from '@/server/schema/relations/upload';
import {getRelationProjectApplicationsCounter, getRelationProjectTypeById} from '../relations/project';
import {getRelationCounters} from '../relations/counter';
import {getRelationMyProjectApplicationByProject} from '../relations/application';
import {getRelationFavoriteByType} from '../relations/favorite';
import {NumberType} from '../types/Scalars';
import {getLocaleResolver} from '@/server/utils/i18n-utils';

const schema = new Schema({
	author: {type: Schema.Types.ObjectId, ref: 'User'},
	type: String,
	title: String,
	title_en: String,
	description: String,
	description_en: String,
	attachment: {type: Schema.Types.ObjectId, ref: 'Upload'},
	specialties: [{type: Schema.Types.ObjectId, ref: 'Specialty'}],
	onlyPremium: Boolean,
	location: {type: Schema.Types.ObjectId, ref: 'City'},
	projectDate: {type: Number},
	endDate: {type: Number},
	period: String,
	hot: {type: Boolean, default: () => false},
	nonCommercial: Boolean,
	budget: Number,
	paycheck: {
		type: {type: String, enum: ['shift', 'project', 'month']},
		amount: Number,
		overtime: Number,
		comment: String,
		currency: {type: String, enum: ['RUB', 'USD'], default: () => 'RUB'}
	},
	references: [
		{
			description: String,
			example: String,
			upload: {type: Schema.Types.ObjectId, ref: 'Upload'}
		}
	],
	test: {
		description: String,
		file: {type: Schema.Types.ObjectId, ref: 'Upload'}
	},
	status: {type: String, enum: ['draft', 'active', 'archived', 'deleted'], default: 'draft'}
});

schema.set('timestamps', true);
schema.set('minimize', false);

schema.virtual('hasTest').get(function (this: {test: {description: any; file: any}}) {
	return Boolean(this.test.description || this.test.file);
});

schema.virtual('applicationEst').get(function (this: any) {
	if (!this.endDate) {
		return 0;
	}
	const est = this.endDate - new Date().getTime();
	return est > 0 ? est : 0;
});

export const ProjectModel = mongoose.model('Project', schema);
export const ProjectTC = composeWithMongoose(ProjectModel);

ProjectTC.addFields({
	localeTitle: getLocaleResolver('title', 'title_en'),
	localeDescription: getLocaleResolver('description', 'description_en'),
	author: () => getRelationUserById('author'),
	type: () => getRelationProjectTypeById('type'),
	location: () => getRelationCityById('location'),
	specialties: () => getRelationSpecialtiesByIds('specialties'),
	attachment: () => getRelationUploadById('attachment'),
	hasTest: 'Boolean',
	applicationEst: NumberType,
	counters: () => getRelationCounters('project', ['applications']),
	application: () => getRelationMyProjectApplicationByProject('_id'),
	isFavorite: () => getRelationFavoriteByType('Project'),
	applicationsCounter: () => getRelationProjectApplicationsCounter(),
	createdAt: {
		type: () => NumberType,
		resolve: (project) => new Date(project.createdAt || project.get?.('createdAt'))?.getTime() || 0
	}
});

ProjectTC.addNestedFields({
	'test.file': () => getRelationUploadById('file'),
	'references.upload': () => getRelationUploadById('upload')
});
