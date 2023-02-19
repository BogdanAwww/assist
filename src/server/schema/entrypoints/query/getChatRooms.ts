import {Context} from '@/server/modules/context';
import {ChatRoomTC, ChatRoomModel} from '../../entities/ChatRoomTC';

export default {
	type: [ChatRoomTC],
	args: {},
	resolve: async (_, _args, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			return ChatRoomModel.find({users: {$in: [user._id]}}).sort({updatedAt: -1});
		}
		return;
	}
};
