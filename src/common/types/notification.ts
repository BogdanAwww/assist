import {Project} from './project';
import {Specialty} from './specialty';
import {User} from './user';

type NotificationType = 'error' | 'success';

interface NotificationItem {
	data?: UserNotification;
	text?: string;
	id?: string;
	view?: NotificationType;
	timeout?: number | boolean;
	close?: boolean;
}

type UserNotificationType =
	| 'new-project-application'
	| 'show-test'
	| 'application-accept'
	| 'application-reject'
	| 'project-invite'
	| 'project-for-contractor';

interface UserNotification {
	_id: string;
	type: UserNotificationType;
	subjects: Record<string, User | Project | Specialty | string | number>;
	isUnread: boolean;
	ts: number;
}

export {NotificationItem, NotificationType, UserNotification, UserNotificationType};
