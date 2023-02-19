import {Country, Viewer} from '@/common/types/user';
import {NotificationItem, UserNotification} from '@/common/types/notification';
import {SpecialtyGroup} from '@/common/types/specialty';
import {ProjectType} from '@/common/types/project';
import {PaginationOutput} from '@/common/types';

interface AppState {
	ready: boolean;
	viewer?: Viewer;
	isLoading?: boolean;
	notifications: NotificationsState;
	countries: Country[];
	specialtyGroups?: SpecialtyGroup[];
	projectTypes?: ProjectType[];
}

interface NotificationsState {
	list: NotificationItem[];
	data?: PaginationOutput<UserNotification, {unread: number}>;
}

export default AppState;
