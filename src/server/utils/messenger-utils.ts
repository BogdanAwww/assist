import messagesManager from '@/server/modules/messages';
import {ChatFileMessageModel, ChatTextMessageModel} from '../schema/entities/ChatMessageTC';
import {ChatRoomModel} from '@/server/schema/entities/ChatRoomTC';
import sanitizeHtml from 'sanitize-html';
import {getTranslation} from '../modules/translates';

export const sendMessageUtil = async (sender, {userId, type, content, file}): Promise<any> => {
	const users = [sender, userId];
	const xssClearContent = sanitizeHtml(content, {
		allowedAttributes: {
			div: ['class']
		}
	});
	let room = await ChatRoomModel.findOne({users: {$all: users}});
	if (!room) {
		room = new ChatRoomModel({users});
		await room.save();
	}
	const contentEn = await getTranslation(xssClearContent, 'en');
	const message =
		type === 'file'
			? new ChatFileMessageModel({room: room._id, type, file, author: sender})
			: new ChatTextMessageModel({
					room: room._id,
					type,
					content: xssClearContent,
					content_en: contentEn,
					author: sender
			  });
	const savedMessage = await message.save();
	messagesManager.send(sender, room, savedMessage);
	room.set('updateField', Math.floor(Math.random() * 100000));
	await room.save();
	return message;
};
