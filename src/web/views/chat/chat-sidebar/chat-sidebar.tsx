import './chat-sidebar.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import Sidebar from '@/common/views/sidebar/sidebar';
import classname from '@/common/core/classname';
import AppState from '@/web/state/app-state';
import chatActions from '@/web/actions/chat-actions';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import ChatRoomList from '@/web/views/chat/chat-room-list/chat-room-list';
import {ChatRoom} from '@/common/types/chat';
import PageTitle from '../../page-title/page-title';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

import closeIcon from '@/common/icons/close.svg';

const mapDispathToProps = {
	close: chatActions.closeSidebar,
	loadRooms: chatActions.loadRooms,
	selectRoom: chatActions.selectRoom
};

interface StateToProps {
	isOpen: boolean;
	rooms: ChatRoom[];
	isMobile?: boolean;
}

type Props = StateToProps & typeof mapDispathToProps;

const connect = ReactRedux.connect(
	(state: AppState): StateToProps => ({
		isOpen: Boolean(state.chat.isSidebarOpen),
		rooms: state.chat.rooms,
		isMobile: state.isMobileLayout
	}),
	mapDispathToProps
);

const b = classname('chat-sidebar');

class ChatSidebar extends React.Component<Props> {
	static contextType = TranslatesContext;
	componentDidMount() {
		this.props.loadRooms();
	}

	componentDidUpdate(prevProps: Props) {
		const props = this.props;
		if (!prevProps.isOpen && props.isOpen) {
			props.loadRooms();
		}
	}

	render(): React.ReactNode {
		const props = this.props;
		const t = this.context.translates;
		return (
			<Sidebar isOpen={props.isOpen} onClose={props.close} compact={!props.isMobile}>
				<PageTitle>{t['chats']}</PageTitle>
				<ChatRoomList rooms={props.rooms} onClick={props.selectRoom} />
				<div className={b('close')} onClick={props.close}>
					<SvgIcon url={closeIcon} width={24} height={24} />
				</div>
			</Sidebar>
		);
	}
}

export default connect(ChatSidebar);
