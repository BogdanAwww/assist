import {schemaComposer} from 'graphql-compose';

export const InviteContractorInput = schemaComposer.createInputTC({
	name: 'InviteContractorInput',
	fields: {
		contractor: 'String!',
		projects: '[String]!'
	}
});
