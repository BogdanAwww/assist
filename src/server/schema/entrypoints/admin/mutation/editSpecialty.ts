import {Context} from '@/server/modules/context';
import {SpecialtyModel} from '@/server/schema/entities/SpecialtyTC';

export default {
	type: 'Boolean',
	args: {
		id: 'String',
		group: 'String',
		titles: 'JSON!',
		isFrequentlyUsed: 'Boolean!'
	},
	resolve: async (_, {id, group, titles, isFrequentlyUsed}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user && user.get('_role')) {
			if (titles.ru || titles.en) {
				if (id) {
					const result = await SpecialtyModel.updateOne({_id: id}, {titles, isFrequentlyUsed, group});
					return Boolean(result);
				} else {
					const specialty = new SpecialtyModel({group, titles, isFrequentlyUsed});
					const result = await specialty.save();
					return Boolean(result);
				}
			}
		}

		return;
	}
};
