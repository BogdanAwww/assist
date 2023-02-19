import {schemaComposer} from 'graphql-compose';
import {ObjectID} from '../Scalars';

const Participant = schemaComposer.createInputTC({
	name: 'Participant',
	fields: {
		username: 'String',
		name: 'String',
		specialty: ObjectID
	}
});

export const CreatePortfolioProjectInput = schemaComposer.createInputTC({
	name: 'CreatePortfolioProjectInput',
	fields: {
		title: 'String',
		description: 'String',
		link: 'String',
		attachment: 'String',
		type: 'String',
		specialty: 'String',
		responsibilities: 'String',
		participants: Participant.NonNull.List
	}
});

export const PortfolioProjectsFilter = schemaComposer.createInputTC({
	name: 'PortfolioProjectsFilter',
	fields: {
		author: 'String!',
		specialty: 'String'
	}
});
