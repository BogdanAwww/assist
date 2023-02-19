import {UserTC} from '@/server/schema/entities/UserTC';
import {userFindOne} from '@/server/vendor/user/userFindOne';

export default {
	type: UserTC,
	args: {username: 'String!'},
	resolve: async (_, {username}, ctx) => {
		return userFindOne({username}, ctx);
	}
};
