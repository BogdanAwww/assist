import {schemaComposer} from 'graphql-compose';

export const FavoritesFilterInput = schemaComposer.createInputTC({
	name: 'FavoritesFilterInput',
	fields: {
		type: 'String'
	}
});
