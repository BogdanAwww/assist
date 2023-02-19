import {Context} from '@/server/modules/context';
import {PromoCodeModel, PromoCodeTC} from '@/server/schema/entities/PromoCodeTC';

export default {
	type: [PromoCodeTC],
	resolve: async (_, _args, ctx: Context) => {
		if (ctx.auth.getUser()) {
			return PromoCodeModel.find({});
		}
		return;
	}
};
