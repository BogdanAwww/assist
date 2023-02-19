import {schemaComposer} from 'graphql-compose';

export const UserUpdateInput = schemaComposer.createInputTC({
	name: 'UserUpdateInput',
	fields: {
		username: 'String!',
		firstName: 'String',
		lastName: 'String',
		description: 'String',
		country: 'String',
		city: 'String',
		email: 'String',
		phone: 'String',
		website: 'String',
		contacts: '[String]',
		avatar: 'String',
		specialties: '[String]',
		hidePhone: 'Boolean',
		hideContacts: 'Boolean',
		busy: 'Boolean',
		isVerified: 'Boolean'
	}
});

export const SignUpInput = schemaComposer.createInputTC({
	name: 'SignUpInput',
	fields: {
		firstName: 'String!',
		lastName: 'String!',
		email: 'String!',
		password: 'String!',
		password2: 'String!',
		hash: 'String',
		isAgree: 'Boolean'
	}
});

export const SearchContractorInput = schemaComposer.createInputTC({
	name: 'SearchContractorInput',
	fields: {
		specialties: '[String]',
		location: 'String',
		isPremium: 'Boolean'
	}
});
