import {schemaComposer} from 'graphql-compose';

export const NotificationsCounterOutput = schemaComposer.createObjectTC({
	name: 'NotificationsCounterOutput',
	fields: {
		unread: 'Int'
	}
});
