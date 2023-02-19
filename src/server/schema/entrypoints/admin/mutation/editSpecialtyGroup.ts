import {Context} from '@/server/modules/context';
import {SpecialtyGroupModel} from '@/server/schema/entities/SpecialtyGroupTC';

export default {
	type: 'Boolean',
	args: {
		id: 'String',
		titles: 'JSON!'
	},
	resolve: async (_, {id, titles}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user && user.get('_role')) {
			if (titles.ru || titles.en) {
				if (id) {
					const result = await SpecialtyGroupModel.updateOne({_id: id}, {titles});
					return Boolean(result);
				} else {
					const ru = titles.ru || '';
					const en = titles.en || '';
					const group = new SpecialtyGroupModel({titles: {ru, en}});
					const result = await group.save();
					return Boolean(result);
				}
			}
		}

		return;
	}
};
