import {Context} from '@/server/modules/context';
import {PromoCodeModel, PromoCodeTC} from '@/server/schema/entities/PromoCodeTC';
import {PromoCodeInput} from '@/server/schema/types/inputs/promocode';

export default {
	type: PromoCodeTC,
	args: {
		input: PromoCodeInput
	},
	resolve: async (_, {input}, ctx: Context) => {
		if (ctx.auth.getUser()) {
			const code = new PromoCodeModel(input);
			return code.save();
		}
		return;
	}
};
