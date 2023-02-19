import {schemaComposer} from 'graphql-compose';

export const MessagesFilterInput = schemaComposer.createInputTC({
	name: 'MessagesFilterInput',
	fields: {
		roomId: 'String!',
		after: 'String',
		before: 'String'
	}
});
