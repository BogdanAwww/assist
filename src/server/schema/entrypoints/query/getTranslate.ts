import {ChatTextMessageModel, ChatTextMessageTC} from './../../entities/ChatMessageTC';
import {Context} from '@/server/modules/context';
import {getTranslation} from '@/server/modules/translates';

export default {
	type: ChatTextMessageTC,
	args: {
		messageId: 'String!',
		lang: 'String'
	},
	resolve: async (_, {messageId, lang}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (!user) {
			return;
		}
		const message = await ChatTextMessageModel.findOne({_id: messageId});
		if (!message.content_en) {
			const translatedContent = await getTranslation(message.content, lang);
			message.set('content_en', translatedContent);
		}
		return message.save();
	}
};
