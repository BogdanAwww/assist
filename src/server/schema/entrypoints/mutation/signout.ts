import {Context} from '@/server/modules/context';
import {Void} from '@/server/schema/types/Scalars';

export default {
	type: Void,
	args: {},
	resolve: async (_, _args, ctx: Context) => {
		if (ctx.auth.getToken()) {
			ctx.auth.signout();
		}
		return;
	}
};
