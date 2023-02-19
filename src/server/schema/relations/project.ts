import {ObjectTypeComposerFieldConfigDefinition, schemaComposer} from 'graphql-compose';
import {ProjectTC} from '@/server/schema/entities/ProjectTC';
import {resolveOneViaDL} from '@/server/schema/dataLoaders';
import {ProjectTypeTC} from '../entities/ProjectTypeTC';
import {projectApplicationFindMany} from '@/server/vendor/project-application/projectApplicationFindMany';
import {ProjectInviteModel} from '../entities/ProjectInviteTC';

export function getRelationProjectById(sourceFieldName: string): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => ProjectTC,
		resolve: resolveOneViaDL('ProjectID', (s) => s[sourceFieldName]),
		projection: {[sourceFieldName]: 1}
	};
}

export function getRelationProjectTypeById(sourceFieldName: string): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => ProjectTypeTC,
		resolve: resolveOneViaDL('ProjectTypeID', (s) => s[sourceFieldName]),
		projection: {[sourceFieldName]: 1}
	};
}

export const ProjectApplicationCounterOutput = schemaComposer.createObjectTC({
	name: 'ProjectApplicationCounterOutput',
	fields: {
		unread: 'Int',
		seen: 'Int',
		test: 'Int',
		accepted: 'Int',
		invites: 'Int'
	}
});

export function getApplicationsCounter(projectId: string): Promise<any> {
	const baseFilter = {
		project: projectId,
		status: 'active'
	};
	return Promise.all([
		projectApplicationFindMany({filter: {project: projectId}}),
		ProjectInviteModel.find({...baseFilter}).countDocuments()
	]).then(([applications, invites]) => {
		return {
			unread: applications.filter((app) => app.get('status') === 'active' && app.get('isUnread')).length,
			seen: applications.filter((app) => app.get('status') === 'active' && !app.get('isUnread')).length,
			test: applications.filter((app) => app.get('status') === 'active' && app.get('showTest')).length,
			accepted: applications.filter((app) => app.get('status') === 'accepted').length,
			invites
		};
	});
}

export function getRelationProjectApplicationsCounter(): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => ProjectApplicationCounterOutput,
		resolve: (source) => {
			return getApplicationsCounter(source._id);
		},
		projection: {_id: 1}
	};
}
