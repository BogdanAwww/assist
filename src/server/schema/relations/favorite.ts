import {ObjectTypeComposerFieldConfigDefinition, schemaComposer} from 'graphql-compose';
import {getDataLoader, resolveOneViaDL} from '../dataLoaders';
import {UserTC} from '../entities/UserTC';
import {ProjectTC} from '../entities/ProjectTC';

export function getRelationFavoriteByType(type: string): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: 'Boolean',
		resolve: resolveOneViaDL('IsFavorite', (s) => ({
			type,
			subject: s._id
		})),
		projection: {_id: 1}
	};
}

const FavoriteSubjectTC = schemaComposer.createUnionTC({
	name: 'FavoriteSubject',
	types: [() => UserTC, () => ProjectTC],
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
		}
		return;
	}
});

const typeDataLoaderMap = {
	User: 'UserID',
	Project: 'ProjectID'
} as const;

export function getRelationFavoriteSubject(): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => FavoriteSubjectTC,
		resolve: (source, _args, context, info) => {
			return getDataLoader(typeDataLoaderMap[source.type], context, info).load(source.subject);
		},
		projection: {subject: 1}
	};
}
