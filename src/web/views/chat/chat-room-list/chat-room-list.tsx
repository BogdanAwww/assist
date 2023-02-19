import './chat-room-list.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';

import classname from '@/common/core/classname';
import {Viewer} from '@/common/types/user';
import AppState from '@/web/state/app-state';
import Avatar from '@/common/views/avatar/avatar';
import {ChatRoom, ChatMessage} from '@/common/types/chat';
import asyncAction, {AsyncAction} from '@/common/core/async-action/async-action';
import {DebouncedFunc, debounce} from 'lodash';
import {searchMessages} from '@/web/actions/chat-provider';
import Preloader from '@/common/views/preloader/preloader';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';
import Input from '@/common/views/input/input';

import zoomIcon from '@/common/icons/zoom.svg';

interface StateToProps {
	viewer: Viewer;
}

interface SelfProps {
	rooms: ChatRoom[];
	activeId?: string;
	onClick: (id: string, message?: ChatMessage) => void;
}

type Props = SelfProps & StateToProps & I18nProps;

interface State {
	searchText: string;
	messages: ChatMessage[];
	error?: string;
	isLoading?: boolean;
}

const connect = ReactRedux.connect((state: AppState): StateToProps => ({viewer: state.viewer!}));

const b = classname('chat-room-list');

class ChatRoomList extends React.PureComponent<Props, State> {
	private _searchAction: AsyncAction | undefined;
	private _debouncedSearch: DebouncedFunc<(query: string) => void>;

	constructor(props: Props) {
		super(props);

		this.state = {
			searchText: '',
			messages: []
		};

		this._debouncedSearch = debounce(this._searchMessages, 200);
	}

	private _onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		this.setState({searchText: e.target.value, messages: []});
		const query = e.target.value.trim();
		this._debouncedSearch(query);
	};

	private _selectRoom = (id: string): void => {
		const [roomId, messageId] = id.split('-');
		const message = this.state.messages.find((message) => message._id === messageId);
		this.props.onClick(roomId, message);
		if (message) {
			this.setState({
				searchText: '',
				messages: [],
				error: undefined
			});
		}
	};

	private _searchMessages = (query: string) => {
		asyncAction.cancel(this._searchAction);
		this.setState({messages: [], error: undefined});
		const t = this.props.translates;
		if (query.length >= 2) {
			this.setState({isLoading: true});
			this._searchAction = asyncAction.create(searchMessages({query}), {
				success: (messages) => {
					this.setState({
						messages: messages || [],
						error: !messages || messages.length === 0 ? t['nothingFound'] : undefined
					});
				},
				fail: () => {
					this.setState({error: t['errorWhenFindMessage']});
				},
				always: () => {
					this.setState({isLoading: false});
				}
			});
		}
	};

	private _getRooms = (): ChatRoom[] => {
		const rooms = this.props.rooms;
		const messages = this.state.messages;
		if (messages.length > 0) {
			return messages.reduce<ChatRoom[]>((acc, message) => {
				const room = rooms.find((room) => room._id === message.room);
				if (room) {
					acc.push({
						...room,
						_id: room._id + '-' + message._id,
						message
					});
				}
				return acc;
			}, []);
		}
		return rooms;
	};

	private _renderSearchButton = (): React.ReactNode => {
		return (
			<div className={b('search-button')}>
				<SvgIcon url={zoomIcon} width={18} height={18} />
			</div>
		);
	};

	private _renderSearch = (): React.ReactNode => {
		const t = this.props.translates;
		return (
			<div className={b('search')}>
				<Input
					placeholder={t['searchMessage']}
					maxLength={50}
					value={this.state.searchText}
					onChange={this._onChange}
					additional={this._renderSearchButton()}
					rounded
				/>
			</div>
		);
	};

	private _renderContent = (): React.ReactNode => {
		const state = this.state;
		if (state.error) {
			return <div className={b('error')}>{state.error}</div>;
		}
		if (state.isLoading) {
			return <Preloader />;
		}
		return this._getRooms().map(this._renderRoom);
	};

	private _renderRoom = (room: ChatRoom): React.ReactNode => {
		const props = this.props;
		const user = room.users.filter((user) => user._id !== props.viewer._id)[0];
		const message = room.message;
		const date = message?.createdAt ? new Date(message?.createdAt).toLocaleDateString() : undefined;
		const t = this.props.translates;

		return (
			<div
				className={b('room', {active: room._id === props.activeId})}
				onClick={() => this._selectRoom(room._id)}
				key={room._id}
			>
				<div className={b('avatar')}>
					<Avatar user={user} size={64} show={false} />
				</div>
				<div className={b('info')}>
					<div className={b('head', {unread: message?.isUnread})}>
						<div className={b('user')}>{user.localeFullname}</div>
						<div className={b('date')}>{date}</div>
					</div>
					{message ? (
						<div className={b('message')}>
							{'content' in message ? (
								<div
									dangerouslySetInnerHTML={{
										__html:
											props.lang === 'ru'
												? message.content
												: message.content_en || message.content
									}}
								/>
							) : (
								t['File']
							)}
						</div>
					) : null}
				</div>
			</div>
		);
	};

	render(): React.ReactNode {
		return (
			<div className={b()}>
				{this._renderSearch()}
				{this._renderContent()}
			</div>
		);
	}
}

export default connect(i18nConnect(ChatRoomList));
