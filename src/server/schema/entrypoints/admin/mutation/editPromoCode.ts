import {Context} from '@/server/modules/context';
import {PromoCodeModel, PromoCodeTC} from '@/server/schema/entities/PromoCodeTC';
import {PromoCodeInput} from '@/server/schema/types/inputs/promocode';

export default {
	type: PromoCodeTC,
	args: {
		id: 'String',
		input: PromoCodeInput
	},
	resolve: async (_, {id, input}, ctx: Context) => {
		if (ctx.auth.getUser()) {
			const code = await PromoCodeModel.findOne({_id: id});
			if (code) {
				code.set(input);
				return code.save();
			}
		}
		return;
	}
};
