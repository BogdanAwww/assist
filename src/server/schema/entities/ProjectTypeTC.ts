import {schemaComposer} from 'graphql-compose';
import types from '@/server/data/project-types.json';

export const PROJECT_TYPES = types;

export const ProjectTypeTC = schemaComposer.createObjectTC({
	name: 'ProjectType',
	fields: {
		id: 'String',
		title: 'String'
	}
});
