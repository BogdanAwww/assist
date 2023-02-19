import {Context} from '@/server/modules/context';
import {ChatTextMessageTC} from '../../entities/ChatMessageTC';
import {messagesFindMany} from '@/server/vendor/chat/messagesFindMany';
import {ChatRoomModel} from '../../entities/ChatRoomTC';

const LIMIT = 20;

export default {
	type: [ChatTextMessageTC],
	args: {
		query: 'String!'
	},
	resolve: async (_, {query}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const rooms = await ChatRoomModel.find({users: user._id});
			if (rooms.length === 0) {
				return [];
			}
			return messagesFindMany({
				filter: {
					room: {$in: rooms.map((room) => room._id)},
					content: new RegExp(query, 'gi')
				},
				limit: LIMIT
			});
		}
		return;
	}
};
