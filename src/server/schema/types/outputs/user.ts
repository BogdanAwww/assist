import {schemaComposer} from 'graphql-compose';
import {UserTC} from '../../entities/UserTC';

export const UserRecommendOutput = schemaComposer.createObjectTC({
	name: 'UserRecommendOutput',
	fields: {
		count: 'Int',
		last: UserTC.List
	}
});
