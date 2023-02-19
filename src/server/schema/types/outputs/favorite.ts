import {schemaComposer} from 'graphql-compose';

export const FavoritesCounterOutput = schemaComposer.createObjectTC({
	name: 'FavoritesCounterOutput',
	fields: {
		User: 'Int',
		Project: 'Int'
	}
});
