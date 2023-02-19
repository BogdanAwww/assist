import {Context} from '@/server/modules/context';
import {ChatMessageModel} from '../../entities/ChatMessageTC';

export default {
	type: 'Boolean',
	args: {
		ids: '[String]!'
	},
	resolve: async (_, {ids}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const messages = await ChatMessageModel.find({_id: {$in: ids}});
			const roomId = messages[0]?.get('room').toString();
			const isFromSingleRoom = roomId && messages.every((message) => message.get('room').toString() === roomId);
			if (!isFromSingleRoom) {
				return;
			}
			await ChatMessageModel.updateMany({_id: {$in: ids}}, {$addToSet: {readBy: user._id}});
			return true;
		}
		return;
	}
};
