import {ObjectTypeComposerFieldConfigDefinition, schemaComposer} from 'graphql-compose';
import {getDataLoader} from '@/server/schema/dataLoaders';
import {UserTC} from '../entities/UserTC';
import {ProjectTC} from '../entities/ProjectTC';
import {SpecialtyTC} from '../entities/SpecialtyTC';
import {ProjectApplicationTC} from '../entities/ProjectApplicationTC';

const NotificationSubjectTC = schemaComposer.createUnionTC({
	name: 'NotificationSubject',
	types: [() => UserTC, () => ProjectTC, () => SpecialtyTC, () => ProjectApplicationTC],
	resolveType: (value) => {
		if (!value) {
			return;
		}
		if (typeof value === 'object') {
			if (value.username) {
				return 'User';
			}
			if (value.title) {
				return 'Project';
			}
			if (value.group && value.titles) {
				return 'Specialty';
			}
			if (value.author && value.project) {
				return 'ProjectApplication';
			}
		}
		return;
	}
});

const SubjectEntryTC = schemaComposer.createObjectTC({
	name: 'SubjectEntry',
	fields: {
		key: 'String',
		original: 'JSON',
		value: NotificationSubjectTC
	}
});

const typeDataLoaderMap = [
	['User', 'UserID'],
	['Project', 'ProjectID'],
	['Specialty', 'SpecialtyID'],
	['Application', 'ApplicationID']
] as const;

export function getRelationNotificationSubjects(
	sourceFieldName: string
): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => [SubjectEntryTC],
		resolve: (source, _args, context, info) => {
			const subjectsValue = (source[sourceFieldName] as Map<string, any>) || new Map();
			const subjectsKeys = Array.from(subjectsValue.keys());
			const subjects = subjectsKeys.map((key) => subjectsValue.get(key));
			return Promise.all(
				typeDataLoaderMap.map(([subjectType, dataLoaderType]) => {
					const ids = subjects.filter((subject) => subject.type === subjectType).map((subject) => subject.id);
					if (ids.length > 0) {
						return getDataLoader(dataLoaderType, context, info).loadMany(ids);
					}
					return [];
				})
			).then((results) => {
				return subjectsKeys.map((key) => {
					const subject = subjectsValue.get(key);
					if (typeof subject === 'object' && subject.type && subject.id) {
						const index = typeDataLoaderMap.findIndex((data) => data[0] === subject.type);
						if (index >= 0) {
							const resultArray = (results[index] || []).filter(Boolean);
							const value = resultArray.find((item) => item._id.toString() === subject.id.toString());
							return {key, value};
						}
					}
					return {key, original: subject};
				});
			});
		},
		projection: {[sourceFieldName]: 1}
	};
}
