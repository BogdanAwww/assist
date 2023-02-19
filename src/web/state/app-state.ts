import {Country, Viewer} from '@/common/types/user';
import {NotificationItem, UserNotification} from '@/common/types/notification';
import {SpecialtyGroup} from '@/common/types/specialty';
import {ProjectType} from '@/common/types/project';
import {PaginationOutput} from '@/common/types';
import {ChatState} from './chat';
import {CurrencyRates} from '@/common/types/common';

interface AppState {
	ready: boolean;
	i18nReady?: boolean;
	viewer?: Viewer;
	isLoading?: boolean;
	notifications: NotificationsState;
	countries: Country[];
	specialtyGroups?: SpecialtyGroup[];
	projectTypes?: ProjectType[];
	chat: ChatState;
	role?: RoleType;
	isMobileLayout?: boolean;
	notificationDialog: NotificationDialog;
	fromSubscribePage?: boolean;
	currencyRates?: CurrencyRates;
}

type RoleType = 'employer' | 'contractor';

export interface NotificationDialog {
	status: boolean;
	item: UserNotification | null;
}

interface NotificationsState {
	list: NotificationItem[];
	data?: PaginationOutput<UserNotification, {unread: number}>;
}

export default AppState;
export {RoleType};
