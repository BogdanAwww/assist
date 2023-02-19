import {wrapRequest} from '@/common/core/wrap-request';
import {ChatRoom, ChatMessage} from '@/common/types/chat';

const getChatRooms = wrapRequest<ChatRoom[]>(require('./graphql/chat/getChatRooms.graphql'), {noCache: true});

const sendMessage = wrapRequest<ChatMessage, {userId: string; type: string; content?: string; file?: string}>(
	require('./graphql/chat/sendMessage.graphql')
);

interface GetMessagesInput {
	roomId: string;
	ts?: string;
	direction?: 'before' | 'after';
	perPage?: number;
}

interface GetMessagesOutput {
	items: ChatMessage[];
	hasItemsBefore: boolean;
	hasItemsAfter: boolean;
	count: number;
}

const getMessages = wrapRequest<GetMessagesOutput, GetMessagesInput>(require('./graphql/chat/getMessages.graphql'), {
	noCache: true
});

const markReadMessages = wrapRequest<boolean, {ids: string[]}>(require('./graphql/chat/markReadMessages.graphql'));

const getUnreadMessagesCount = wrapRequest<number>(require('./graphql/chat/getUnreadMessagesCount.graphql'), {
	noCache: true
});

const searchMessages = wrapRequest<ChatMessage[], {query: string}>(require('./graphql/chat/searchMessages.graphql'), {
	noCache: true
});

const getTranslate = wrapRequest<string, {messageId: string; lang: 'ru' | 'en'}>(
	require('./graphql/getTranslate.graphql'),
	{
		noCache: true
	}
);

export {getChatRooms, sendMessage, getMessages, markReadMessages, getUnreadMessagesCount, searchMessages, getTranslate};
