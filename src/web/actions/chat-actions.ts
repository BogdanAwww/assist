import {PlainAction, ThunkAction} from '@/common/core/state/actions';
import AppState from '../state/app-state';
import {User} from '@/common/types/user';
import history from '@/common/core/history';
import {getChatRooms, getMessages, markReadMessages, getUnreadMessagesCount} from './chat-provider';
import {ChatMessage, ChatRoom} from '@/common/types/chat';
import {uniqBy} from 'lodash';

const MESSAGES_PER_PAGE = 50;

const chatActions = {
	showSidebar: (): PlainAction<AppState> => ({
		type: 'DEEP_EXTEND',
		payload: {
			chat: {isSidebarOpen: true}
		}
	}),
	counterInc:
		(inc: number): ThunkAction<AppState> =>
		(dispatch, getState) => {
			const state = getState();
			dispatch({
				type: 'DEEP_EXTEND',
				payload: {
					chat: {unread: state.chat.unread + inc}
				}
			});
		},
	loadRooms: (): ThunkAction<AppState> => async (dispatch) => {
		const rooms = await getChatRooms();
		dispatch({
			type: 'DEEP_EXTEND',
			payload: {
				chat: {
					rooms: rooms ? prepareRooms(...rooms) : []
				}
			}
		});
	},
	selectRoom:
		(selectedRoomId: string, searchMessage?: ChatMessage): ThunkAction<AppState> =>
		(dispatch, getState) => {
			const state = getState();
			const rooms = state.chat.rooms;
			const isExist = rooms.find((room) => room._id === selectedRoomId);
			if (!isExist) {
				dispatch(chatActions.loadRooms());
			}
			if (selectedRoomId) {
				history.push(`/chat/${selectedRoomId}`);
			}
			if (state.chat.selectedRoomId === selectedRoomId && !searchMessage) {
				dispatch({
					type: 'DEEP_EXTEND',
					payload: {
						chat: {
							isSidebarOpen: false
						}
					}
				});
				return;
			}
			dispatch({
				type: 'DEEP_EXTEND',
				payload: {
					chat: {
						isSidebarOpen: false,
						selectedRoomId,
						searchMessage,
						messages: {
							items: [searchMessage].filter(Boolean),
							total: 0,
							hasItemsBefore: true,
							hasItemsAfter: Boolean(searchMessage),
							isLoadingBefore: false,
							isLoadingAfter: false
						}
					}
				}
			});
		},
	openUserChat:
		(user: User): ThunkAction<AppState> =>
		(dispatch, getState) => {
			const rooms = getState().chat.rooms;
			const room = rooms.find((room) => room.users.find((lookupUser) => lookupUser._id === user?._id));
			if (room) {
				dispatch({
					type: 'DEEP_EXTEND',
					payload: {
						chat: {
							selectedRoomId: room._id,
							messages: {
								items: [],
								total: 0,
								hasItemsBefore: true,
								hasItemsAfter: false,
								isLoadingBefore: false,
								isLoadingAfter: false
							}
						}
					}
				});
				history.push(`/chat/${room._id}`);
				return;
			}
			dispatch({
				type: 'DEEP_EXTEND',
				payload: {
					chat: {
						user,
						messages: {
							items: [],
							total: 0,
							hasItemsBefore: true,
							hasItemsAfter: false,
							isLoadingBefore: false,
							isLoadingAfter: false
						}
					}
				}
			});
			history.push('/chat');
		},
	loadMessages:
		(direction: 'before' | 'after'): ThunkAction<AppState> =>
		(dispatch, getState) => {
			const state = getState();
			const chat = state.chat;
			const room = getRoom(state);
			const isLoadingKey = direction === 'after' ? 'isLoadingAfter' : 'isLoadingBefore';
			const hasItems = direction === 'before' ? chat.messages.hasItemsBefore : chat.messages.hasItemsAfter;
			if (!room || !room._id || chat.messages[isLoadingKey] || !hasItems) {
				return;
			}
			const messages = chat.messages.items;
			const lastMessage = messages[direction === 'after' ? 0 : messages.length - 1];
			getMessages({
				roomId: room._id,
				ts: lastMessage?.createdAt,
				direction,
				perPage: MESSAGES_PER_PAGE
			}).then(
				(output) => {
					if (output) {
						const currentState = getState();
						const currentRoom = getRoom(currentState);
						if (currentRoom && room._id !== currentRoom._id) {
							return;
						}
						const stateMessages = currentState.chat.messages;
						// console.log(direction, output);
						dispatch({
							type: 'DEEP_EXTEND',
							payload: {
								chat: {
									searchMessage: undefined,
									messages: {
										items: prepareMessages(...stateMessages.items, ...output.items),
										total: output.count,
										hasItemsAfter:
											direction === 'after' ? output.hasItemsAfter : stateMessages.hasItemsAfter,
										hasItemsBefore:
											direction === 'before'
												? output.hasItemsBefore
												: stateMessages.hasItemsBefore,
										[isLoadingKey]: false
									}
								}
							}
						});
					}
				},
				() => {
					dispatch({
						type: 'DEEP_EXTEND',
						payload: {
							chat: {messages: {[isLoadingKey]: false}}
						}
					});
				}
			);
		},
	addMessage:
		(message: ChatMessage, replaceId?: string): ThunkAction<AppState> =>
		(dispatch, getState) => {
			const chat = getState().chat;
			const room = chat.rooms.find((room) => room._id === message.room);
			if (room) {
				const rooms = chat.rooms.map((room) => {
					if (room._id === message.room) {
						return {
							...room,
							message
						};
					}
					return room;
				});
				dispatch({
					type: 'DEEP_EXTEND',
					payload: {
						chat: {
							rooms: prepareRooms(...rooms)
						}
					}
				});
			}
			if (chat.selectedRoomId === message.room) {
				const existingMessages = chat.messages.items;
				const items = existingMessages.find((lookupMessage) => lookupMessage._id === replaceId)
					? existingMessages.map((lookupMessage) =>
							lookupMessage._id === replaceId ? message : lookupMessage
					  )
					: [message, ...existingMessages];
				dispatch({
					type: 'DEEP_EXTEND',
					payload: {
						chat: {
							messages: {
								items: prepareMessages(...items)
							}
						}
					}
				});
			}
		},
	markRead:
		(ids: string[]): ThunkAction<AppState> =>
		(dispatch, getState) => {
			if (ids.length > 0) {
				markReadMessages({ids}).then(() => {
					const chat = getState().chat;
					dispatch({
						type: 'DEEP_EXTEND',
						payload: {
							chat: {
								rooms: chat.rooms.map((room) =>
									room.message?._id && ids.includes(room.message._id)
										? {...room, message: {...room.message, isUnread: false}}
										: room
								),
								messages: {
									items: chat.messages.items.map((message) =>
										ids.includes(message._id) ? {...message, isUnread: false} : message
									)
								}
							}
						}
					});
					dispatch(chatActions.getUnreadCount());
				});
			}
		},
	getUnreadCount: (): ThunkAction<AppState> => (dispatch) => {
		getUnreadMessagesCount().then((unread) => {
			dispatch({
				type: 'DEEP_EXTEND',
				payload: {
					chat: {unread}
				}
			});
		});
	},
	closeRoom: (): PlainAction<AppState> => ({
		type: 'DEEP_EXTEND',
		payload: {
			chat: {
				user: undefined,
				selectedRoomId: ''
			}
		}
	}),
	closeSidebar: (): PlainAction<AppState> => ({
		type: 'DEEP_EXTEND',
		payload: {
			chat: {isSidebarOpen: false}
		}
	}),
	translateMessage: (message, index) => (dispatch, getState) => {
		const messages = getState().chat.messages;
		const items = messages.items;
		const newItems = JSON.parse(JSON.stringify(items));
		newItems[index] = message;
		dispatch({
			type: 'DEEP_EXTEND',
			payload: {
				chat: {
					messages: {
						items: newItems
					}
				}
			}
		});
	}
};

function getRoom(state: AppState): ChatRoom | undefined {
	const chat = state.chat;
	return chat.user
		? chat.rooms.find((room) => room.users.find((lookupUser) => lookupUser._id === chat.user?._id)) || {
				_id: '',
				users: [state.viewer!, chat.user]
		  }
		: chat.rooms.find((room) => room._id === chat.selectedRoomId);
}

function prepareRooms(...rooms: ChatRoom[]): ChatRoom[] {
	const uniqMessages = uniqBy(rooms, '_id');
	return uniqMessages.sort(
		(a, b) => new Date(b.message!.createdAt).getTime() - new Date(a.message!.createdAt).getTime()
	);
}

function prepareMessages(...messages: ChatMessage[]): ChatMessage[] {
	const uniqMessages = uniqBy(messages, '_id');
	return uniqMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default chatActions;
