import {User} from '@/common/types/user';
import {ChatRoom, ChatMessage} from '@/common/types/chat';

interface ChatState {
	unread: number;
	isSidebarOpen?: boolean;
	user?: User;
	rooms: ChatRoom[];
	selectedRoomId?: string;
	searchMessage?: ChatMessage;
	messages: {
		items: ChatMessage[];
		total: number;
		hasItemsBefore: boolean;
		hasItemsAfter: boolean;
		isLoadingBefore?: boolean;
		isLoadingAfter?: boolean;
	};
}

export {ChatState};
