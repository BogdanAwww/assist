import {schemaComposer} from 'graphql-compose';

export const PromoCodeInput = schemaComposer.createInputTC({
	name: 'PromoCodeInput',
	fields: {
		code: 'String!',
		type: 'String!',
		data: 'JSON!',
		multiple: 'Boolean'
	}
});
