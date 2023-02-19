import {Context} from '@/server/modules/context';
import {model} from 'mongoose';
import {FavoriteModel} from '../../entities/FavoriteTC';

export default {
	type: 'Boolean',
	args: {
		type: 'String!',
		id: 'String!',
		state: 'Boolean'
	},
	resolve: async (_, {type, id, state}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const Model = model(type);
			if (Model) {
				const subject = await Model.findOne({_id: id});
				if (subject) {
					return FavoriteModel.updateOne(
						{user: user._id, type, subject: id},
						{isDeleted: !state},
						{upsert: true}
					).then(() => true);
				}
			}
		}

		return;
	}
};
