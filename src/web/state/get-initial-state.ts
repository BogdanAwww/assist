import qs from 'qs';
import AppState, {RoleType} from './app-state';

const ROLES = ['contractor', 'employer'];

function getInitialState(): AppState {
	return {
		ready: false,
		notifications: {list: []},
		countries: [],
		chat: {
			unread: 0,
			rooms: [],
			selectedRoomId: '',
			messages: {items: [], total: 0, hasItemsBefore: false, hasItemsAfter: false}
		},
		role: getRoleState(),
		notificationDialog: {
			status: false,
			item: null
		}
	};
}

function getRoleState(): RoleType | undefined {
	const query = qs.parse(window.location.search, {ignoreQueryPrefix: true});
	const queryRole = ROLES.includes(query.role as string) ? (query.role as string) : undefined;
	if (queryRole) {
		localStorage.setItem('role', queryRole);
	}
	const role = queryRole || localStorage.getItem('role');
	if (role === 'contractor' || role === 'employer') {
		return role;
	}
	if (localStorage.getItem('token') && !role) {
		return 'contractor';
	}
	return;
}

export default getInitialState;
