import {Context} from '@/server/modules/context';
import {ChatMessageModel} from '../../entities/ChatMessageTC';
import {ChatRoomModel} from '../../entities/ChatRoomTC';

export default {
	type: 'Int',
	args: {},
	resolve: async (_, _args, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const rooms = await ChatRoomModel.find({users: {$in: [user._id]}});
			if (rooms.length === 0) {
				return 0;
			}
			const roomsIds = rooms.map((room) => room._id);
			return ChatMessageModel.countDocuments({
				author: {$ne: user._id},
				room: {$in: roomsIds},
				readBy: {$ne: user._id}
			});
		}
		return 0;
	}
};
