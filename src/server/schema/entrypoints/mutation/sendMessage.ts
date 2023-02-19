import {sendMessageUtil} from '../../../utils/messenger-utils';
import {Context} from '@/server/modules/context';
import {ChatMessageUTC} from '../../entities/ChatMessageTC';

export default {
	type: ChatMessageUTC,
	args: {
		userId: 'String!',
		type: 'String!',
		content: 'String',
		file: 'String'
	},
	resolve: async (_, {userId, type, content, file}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const message = sendMessageUtil(user._id, {userId, type, content, file});
			return message;
		}
		return;
	}
};
