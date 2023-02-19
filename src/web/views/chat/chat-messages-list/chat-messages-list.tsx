import './chat-messages-list.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';

import classname from '@/common/core/classname';
import {Viewer, User} from '@/common/types/user';
import AppState from '@/web/state/app-state';
import Avatar from '@/common/views/avatar/avatar';
import {ChatRoom, ChatMessage, ChatFileMessage} from '@/common/types/chat';
import Textarea from '@/common/views/textarea/textarea';
import {sendMessage} from '@/web/actions/chat-provider';
import {throttle, DebouncedFunc} from 'lodash';
import chatActions from '@/web/actions/chat-actions';
import Button from '@/common/views/button/button';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import composeConnect from '@/common/core/compose/compose';
import {withRouter, RouteComponentProps} from 'react-router';
import Uploader from '@/common/views/uploader/uploader';
import {DocumentUpload} from '@/common/types/upload';
import Preloader from '@/common/views/preloader/preloader';
import MessageContent from '@/web/views/message-content';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

import sendIconUrl from '@/common/icons/send.svg';
import clipIconUrl from '@/common/icons/clip.svg';
import fileIconUrl from '@/common/icons/file.svg';
import closeIconUrl from '@/common/icons/close.svg';

const mapDispatchToProps = {
	loadMessages: chatActions.loadMessages,
	addMessage: chatActions.addMessage,
	markRead: chatActions.markRead,
	selectRoom: chatActions.selectRoom,
	close: chatActions.closeRoom
};

interface StateToProps {
	viewer: Viewer;
	messages: ChatMessage[];
	searchMessage?: ChatMessage;
	hasItemsBefore?: boolean;
	hasItemsAfter?: boolean;
	isLoadingBefore?: boolean;
	isLoadingAfter?: boolean;
	isMobile?: boolean;
}

interface SelfProps {
	room: ChatRoom;
}

type ReduxProps = StateToProps & typeof mapDispatchToProps;

type Props = SelfProps & ReduxProps & RouteComponentProps;

interface State {
	text: string;
	needScrollDown: boolean;
	needScrollToId?: string;
}

const connect = composeConnect<SelfProps, ReduxProps, RouteComponentProps>(
	ReactRedux.connect(
		(state: AppState): StateToProps => ({
			viewer: state.viewer!,
			messages: state.chat.messages.items,
			searchMessage: state.chat.searchMessage,
			isLoadingBefore: state.chat.messages.isLoadingBefore,
			isLoadingAfter: state.chat.messages.isLoadingAfter,
			hasItemsBefore: state.chat.messages.hasItemsBefore,
			hasItemsAfter: state.chat.messages.hasItemsAfter,
			isMobile: state.isMobileLayout
		}),
		mapDispatchToProps
	),
	withRouter
);

const b = classname('chat-messages-list');

const TEXTAREA_MAX_HEIGHT = 98;
const INFINITE_LOAD_THRESHOLD = 300;
const MARK_UNREAD_COUNT = 20;
const SCROLL_BOTTOM_THRESHOLD = 200;

class ChatMessagesList extends React.PureComponent<Props, State> {
	private _scrollRef = React.createRef<HTMLDivElement>();
	private _textareaRef = React.createRef<HTMLTextAreaElement>();
	private _throttledScroll: DebouncedFunc<() => void>;
	private _throttledLoadMessagesBefore: DebouncedFunc<() => void>;
	private _throttledLoadMessagesAfter: DebouncedFunc<() => void>;
	static contextType = TranslatesContext;

	constructor(props: Props) {
		super(props);

		this.state = {
			text: '',
			needScrollDown: true
		};

		this._throttledScroll = throttle(this._checkScroll, 100);
		this._throttledLoadMessagesBefore = throttle(this._checkLoadMessagesBefore, 100);
		this._throttledLoadMessagesAfter = throttle(this._checkLoadMessagesAfter, 100);
	}

	componentDidMount() {
		const props = this.props;
		setTimeout(() => {
			props.loadMessages('before');
			this._checkLoadMessagesAfter();
		});
		if (props.isMobile) {
			window.addEventListener('scroll', this._throttledScroll);
		}
	}

	componentWillUnmount() {
		const props = this.props;
		if (props.isMobile) {
			window.removeEventListener('scroll', this._throttledScroll);
		}
	}

	componentDidUpdate(prevProps: Props) {
		const props = this.props;
		if (props.room._id !== prevProps.room._id || props.searchMessage) {
			props.loadMessages('before');
			this._checkLoadMessagesAfter();
			const searchMessage = props.searchMessage;
			this.setState({
				needScrollDown: !searchMessage,
				needScrollToId: searchMessage?._id
			});
			return;
		}
		this._checkEnoughMessages();
		const el = this._getScrollingNode();
		if (el) {
			const state = this.state;
			const needScrollDown =
				state.needScrollDown || el.scrollTop + el.offsetHeight > el.scrollHeight - SCROLL_BOTTOM_THRESHOLD;
			if (needScrollDown && props.messages.length !== prevProps.messages.length) {
				el.scrollTop = el.scrollHeight;
				this.setState({needScrollDown: false});
			}
			const message = state.needScrollToId
				? props.messages.find((message) => message._id === state.needScrollToId)
				: undefined;
			setTimeout(() => {
				const messageEl = message ? document.querySelector('#message-' + message._id) : undefined;
				if (messageEl) {
					const messageRect = messageEl.getBoundingClientRect();
					const containerRect = el.getBoundingClientRect();
					const height = el.offsetHeight;
					const dy = containerRect.top - messageRect.top + Math.floor(height / 2);
					if (Math.abs(dy) > 100) {
						el.scrollTop = el.scrollTop - dy;
					} else {
						this.setState({needScrollToId: undefined});
					}
				}
			});
		}
		const unreadMessages = props.messages.filter((message) => message.isUnread).slice(0, MARK_UNREAD_COUNT);
		if (unreadMessages.length > 0) {
			props.markRead(unreadMessages.map((message) => message._id));
		}
	}

	private _getScrollingNode = (): HTMLElement | null => {
		return this.props.isMobile ? document.querySelector('html') : this._scrollRef.current;
	};

	private _onUserClick = (user: User): void => {
		this.props.history.push(`/profile/${user.username}`);
	};

	private _checkEnoughMessages = (): void => {
		const el = this._getScrollingNode();
		if (el) {
			const height = el.offsetHeight || 0;
			const scrollHeight = el.scrollHeight || 0;
			if (scrollHeight <= height) {
				this._throttledLoadMessagesBefore();
			}
		}
	};

	private _checkScroll = (): void => {
		const el = this._getScrollingNode();
		if (el) {
			const scrollTop = el.scrollTop;
			const scrollHeight = el.scrollHeight;
			const height = el.offsetHeight;
			if (scrollTop < INFINITE_LOAD_THRESHOLD) {
				this._throttledLoadMessagesBefore();
			}
			if (scrollHeight - (scrollTop + height) < INFINITE_LOAD_THRESHOLD) {
				this._throttledLoadMessagesAfter();
			}
		}
	};

	private _checkLoadMessagesBefore = (): void => {
		const props = this.props;
		if (!props.isLoadingBefore && props.hasItemsBefore) {
			props.loadMessages('before');
		}
	};

	private _checkLoadMessagesAfter = (): void => {
		const props = this.props;
		if (!props.isLoadingAfter && props.hasItemsAfter) {
			props.loadMessages('after');
		}
	};

	private _createMessageDummy = (type: ChatMessage['type'], file?: DocumentUpload): ChatMessage => {
		const props = this.props;
		const base = {
			_id: '' + new Date().getTime() + Math.random() * 1000000,
			room: props.room._id,
			author: props.viewer,
			isUnread: false,
			createdAt: new Date().toUTCString(),
			isSending: true
		};
		if (type === 'text') {
			return {
				...base,
				type,
				content: this.state.text.trim()
			};
		}
		return {
			...base,
			type,
			file: file!
		};
	};

	private _createFileMessage = (upload: DocumentUpload): void => {
		const message = this._createMessageDummy('file', upload);
		this.props.addMessage(message);
	};

	private _sendFileMessage = (upload: DocumentUpload, dummyId: string): void => {
		const message = this.props.messages.find((message) => message.type === 'file' && message.file._id === dummyId);
		if (message && message.type === 'file') {
			const newMessage = {
				...message,
				file: upload
			};
			this.props.addMessage(newMessage);
			this._sendMessage(newMessage);
		}
	};

	private _sendTextMessage = (): void => {
		const message = this._createMessageDummy('text');
		this.props.addMessage(message);
		this._sendMessage(message);
		setTimeout(() => {
			this.setState({text: ''}, this._resizeTextarea);
		});
	};

	private _sendMessage = (message: ChatMessage): void => {
		const props = this.props;
		const user = props.room.users.filter((user) => user._id !== props.viewer._id)[0];
		this.setState({needScrollDown: true});
		sendMessage({
			userId: user._id,
			type: message.type,
			content: 'content' in message ? message.content : undefined,
			file: 'file' in message ? message.file._id : undefined
		}).then((savedMessage) => {
			if (savedMessage) {
				if (!props.room._id) {
					props.selectRoom(savedMessage.room);
				}
				props.addMessage(savedMessage, message._id);
			}
		});
	};

	private _onChangeText = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
		this._resizeTextarea();
		this.setState({text: e.target.value});
	};

	private _resizeTextarea = (): void => {
		const el = this._textareaRef.current;
		if (el) {
			el.style.height = 'auto';
			const scrollHeight = el.scrollHeight + parseInt(el.style.borderWidth) * 2;
			el.style.height = (scrollHeight > TEXTAREA_MAX_HEIGHT ? TEXTAREA_MAX_HEIGHT : scrollHeight) + 'px';
		}
	};

	private _onKeyDown = (e: React.KeyboardEvent): void => {
		const text = this.state.text.trim();
		if (e.keyCode === 13) {
			if (text.length > 0) {
				if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
					this._sendTextMessage();
					e.preventDefault();
				}
			} else {
				e.preventDefault();
			}
		}
	};

	private _openFile = (file: DocumentUpload): void => {
		window.open(file.url, '_blank');
	};

	private _renderFileContent = (message: ChatFileMessage) => {
		const file = message.file;
		const backgroundImage = file.isImage && file.url ? `url(${file.url})` : undefined;
		return (
			<div className={b('file')} onClick={() => this._openFile(message.file)}>
				<div className={b('file-icon', {'has-image': Boolean(backgroundImage)})} style={{backgroundImage}}>
					{message.isSending ? (
						<Preloader size="xs" />
					) : backgroundImage ? null : (
						<SvgIcon url={fileIconUrl} width={24} height={24} />
					)}
				</div>
				<div className={b('file-info')}>{message.file.filename}</div>
			</div>
		);
	};

	private _renderMessage = (message: ChatMessage, index: number, arr: ChatMessage[]): React.ReactNode => {
		const viewer = this.props.viewer;
		const author = message.author;
		const lang = this.context.lang;
		const prevMessage = arr[index + 1];
		const sameDay = prevMessage
			? new Date(prevMessage.createdAt).toLocaleDateString() === new Date(message.createdAt).toLocaleDateString()
			: false;
		const same = sameDay ? prevMessage?.author._id === message.author._id : false;
		const onClick = author._id !== viewer._id ? () => this._onUserClick(author) : undefined;
		return (
			<React.Fragment key={message._id}>
				<div className={b('message', {own: viewer._id === author._id, same})} id={'message-' + message._id}>
					<div className={b('avatar')} onClick={onClick}>
						<Avatar user={author} size={32} show={false} />
					</div>
					<MessageContent
						classNames={[b('text'), b('time'), b('content'), b('username'), b('content-wrap')]}
						message={message}
						index={index}
						renderFileContent={this._renderFileContent}
						same={same}
						author={author}
						onClick={onClick}
						lang={lang}
					/>
					<div className={b('spacer')} />
				</div>
				{sameDay ? null : (
					<div className={b('date')}>
						<div className={b('date-badge')}>{new Date(message.createdAt).toLocaleDateString()}</div>
					</div>
				)}
			</React.Fragment>
		);
	};

	private _renderInput = (): React.ReactNode => {
		return (
			<div className={b('input-container')}>
				<div className={b('upload')}>
					<Uploader type="document" onUploadStart={this._createFileMessage} onChange={this._sendFileMessage}>
						{({onClick}) => (
							<Button
								view="invisible"
								size="small"
								icon={<SvgIcon url={clipIconUrl} width={20} height={20} />}
								onClick={onClick}
							/>
						)}
					</Uploader>
				</div>
				<div className={b('input')}>
					<Textarea
						value={this.state.text}
						size="xs"
						rows={1}
						onChange={this._onChangeText}
						onKeyDown={this._onKeyDown}
						noMargin
						inputRef={this._textareaRef}
					/>
				</div>
				<div className={b('send')}>
					<Button
						view="dark"
						size="small"
						icon={<SvgIcon url={sendIconUrl} width={16} height={16} />}
						onClick={this._sendTextMessage}
					/>
				</div>
			</div>
		);
	};

	render(): React.ReactNode {
		const props = this.props;
		return (
			<div className={b({mobile: props.isMobile})}>
				<div
					className={b('scroll-container')}
					ref={this._scrollRef}
					onScroll={props.isMobile ? undefined : this._throttledScroll}
				>
					<div className={b('container')}>{props.messages.map(this._renderMessage)}</div>
				</div>
				{props.isMobile && props.room ? (
					<div className={b('mobile-close')} onClick={props.close}>
						{this.context.translates.closeChat}
						<SvgIcon url={closeIconUrl} width={14} height={14} />
					</div>
				) : null}
				{this._renderInput()}
			</div>
		);
	}
}

export default connect(ChatMessagesList);
