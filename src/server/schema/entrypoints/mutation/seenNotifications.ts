import {Context} from '@/server/modules/context';
import {NotificationModel} from '../../entities/NotificationTC';

export default {
	type: 'Boolean',
	args: {
		ids: '[String]!'
	},
	resolve: async (_, {ids}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			NotificationModel.bulkWrite(
				ids.map((id) => {
					return {
						updateOne: {
							filter: {user: user._id, _id: id},
							update: {
								isUnread: false
							}
						}
					};
				})
			);
		}

		return;
	}
};
