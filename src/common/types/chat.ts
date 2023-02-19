import {User} from './user';
import {DocumentUpload} from './upload';

interface BaseChatMessage {
	_id: string;
	room: string;
	author: User;
	isUnread: boolean;
	createdAt: string;
	isSending?: boolean;
}

interface ChatTextMessage extends BaseChatMessage {
	type: 'text';
	content: string;
	content_en?: string;
}

interface ChatFileMessage extends BaseChatMessage {
	type: 'file';
	file: DocumentUpload;
}

type ChatMessage = ChatTextMessage | ChatFileMessage;

interface ChatRoom {
	_id: string;
	users: User[];
	message?: ChatMessage;
}

export {ChatRoom, ChatMessage, ChatTextMessage, ChatFileMessage};
