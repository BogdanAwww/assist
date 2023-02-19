import {userFindMany} from '@/server/vendor/user/userFindMany';

export default {
	type: 'Boolean',
	args: {},
	resolve: async () => {
		const userCount = await userFindMany({filter: {verified: true}, count: true});
		return userCount < 1000;
	}
};
