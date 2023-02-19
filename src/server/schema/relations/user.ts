import {ObjectTypeComposerFieldConfigDefinition, schemaComposer} from 'graphql-compose';
import {UserTC} from '@/server/schema/entities/UserTC';
import {resolveManyViaDL, resolveOneViaDL} from '@/server/schema/dataLoaders';
import {ProjectModel} from '../entities/ProjectTC';
import {ProjectApplicationModel} from '../entities/ProjectApplicationTC';

export function getRelationUserById(sourceFieldName: string): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => UserTC,
		resolve: resolveOneViaDL('UserID', (s) => s[sourceFieldName]),
		projection: {[sourceFieldName]: 1}
	};
}

export function getRelationUsersByIds(sourceFieldName: string): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => [UserTC],
		resolve: resolveManyViaDL('UserID', (s) => s[sourceFieldName]),
		projection: {[sourceFieldName]: 1}
	};
}

export function getRelationUserField(
	type: any,
	sourceFieldName: string,
	projection: string
): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type,
		resolve: (s) => s[sourceFieldName],
		projection: {[projection]: 1}
	};
}

const SubscriptionStatsFieldTC = schemaComposer.createObjectTC({
	name: 'SubscriptionStatsField',
	fields: {
		projects: 'Int',
		applications: 'Int',
		boosts: 'Int'
	}
});

const SubscriptionStatsTC = schemaComposer.createObjectTC({
	name: 'SubscriptionStats',
	fields: {
		quota: SubscriptionStatsFieldTC,
		total: SubscriptionStatsFieldTC
	}
});

export function getRelationSubscriptionStats(): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: SubscriptionStatsTC,
		resolve: async (user) => {
			const total = await Promise.all([
				ProjectModel.find({author: user._id}).countDocuments(),
				ProjectApplicationModel.find({author: user._id}).countDocuments()
			]).then(([projects, applications]) => {
				return {
					projects: projects || 0,
					applications: applications || 0
				};
			});
			return {
				quota: user._subscription?.quota || {projects: 0, applications: 0, boosts: 0},
				total
			};
		},
		projection: {_id: 1, _subscription: 1}
	};
}

export function getRelationIsRecommended(): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: 'Boolean',
		resolve: resolveOneViaDL('IsRecommended', (user) => user._id),
		projection: {_id: 1}
	};
}
