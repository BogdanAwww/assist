import './chat.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import FixedSideView from '@/web/views/fixed-side-view/fixed-side-view';
import PageTitle from '@/web/views/page-title/page-title';
import chatActions from '@/web/actions/chat-actions';
import AppState from '@/web/state/app-state';
import {User, Viewer} from '@/common/types/user';
import ChatRoomList from '@/web/views/chat/chat-room-list/chat-room-list';
import {ChatRoom} from '@/common/types/chat';
import ChatMessagesList from '@/web/views/chat/chat-messages-list/chat-messages-list';
import composeConnect from '@/common/core/compose/compose';
import {withRouter, RouteComponentProps} from 'react-router';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

const mapDispatchToProps = {
	close: chatActions.closeRoom,
	selectRoom: chatActions.selectRoom,
	loadRooms: chatActions.loadRooms
};

interface StateToProps {
	viewer: Viewer;
	user?: User;
	rooms: ChatRoom[];
	room?: ChatRoom;
	selectedRoomId?: string;
	isMobile?: boolean;
}

interface SelfProps {}

type Props = SelfProps & StateToProps & typeof mapDispatchToProps & RouteComponentProps<{roomId: string}>;

const connect = composeConnect(
	ReactRedux.connect((state: AppState): StateToProps => {
		const chat = state.chat;
		const userRoom = chat.user
			? chat.rooms.find((room) => room.users.find((lookupUser) => lookupUser._id === chat.user?._id)) || {
					_id: '',
					users: [state.viewer!, chat.user]
			  }
			: undefined;
		const chatRooms = userRoom ? chat.rooms.filter((room) => room !== userRoom) : chat.rooms;
		const rooms = [userRoom, ...chatRooms].filter(Boolean) as ChatRoom[];
		const selectedRoomId = userRoom?._id || chat.selectedRoomId;
		const selectedRoom = rooms.filter((room) => room._id === selectedRoomId)[0];
		return {
			viewer: state.viewer!,
			user: chat.user,
			rooms,
			selectedRoomId,
			room: selectedRoom,
			isMobile: state.isMobileLayout
		};
	}, mapDispatchToProps),
	withRouter
);

const b = classname('chat-page');

class ChatPage extends React.PureComponent<Props> {
	static contextType = TranslatesContext;
	componentDidMount() {
		const props = this.props;
		const selectedRoomId = props.match.params.roomId;
		if (selectedRoomId) {
			props.selectRoom(selectedRoomId);
		}
		props.loadRooms();
	}

	componentWillUnmount() {
		this.props.close();
	}

	private _renderRooms = (): React.ReactNode => {
		const props = this.props;
		const t = this.context.translates;
		if (props.room && props.isMobile) {
			return null;
		}
		return (
			<>
				<PageTitle>{t['chats']}</PageTitle>
				<ChatRoomList rooms={props.rooms} activeId={props.selectedRoomId} onClick={props.selectRoom} />
			</>
		);
	};

	private _renderMessages = (): React.ReactNode => {
		const props = this.props;
		const room = props.room;
		if (!room) {
			return null;
		}
		return (
			<div className={b('messages')}>
				<ChatMessagesList room={room} />
			</div>
		);
	};

	render(): React.ReactNode {
		return (
			<div className={b({mobile: this.props.isMobile})}>
				<FixedSideView side={this._renderRooms()}>{this._renderMessages()}</FixedSideView>
			</div>
		);
	}
}

export default connect(ChatPage);
