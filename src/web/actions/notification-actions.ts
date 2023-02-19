import {ThunkAction, ThunkDispatch} from '@/common/core/state/actions';
import AppState, {RoleType} from '../state/app-state';
import {NotificationItem, UserNotification} from '@/common/types/notification';
import {getId} from '@/common/utils/notification-utils';
import history from '@/common/core/history';
import {Project} from '@/common/types/project';

const DEFAULT_TIMEOUT = 4000;

type Action = ThunkAction<AppState>;

const notificationActions = {
	showNotification:
		(item: NotificationItem): Action =>
		(dispatch, getState) => {
			const state = getState();
			dispatch({
				type: 'EXTEND',
				payload: {
					notifications: {
						...state.notifications,
						list: [
							...state.notifications.list,
							{
								...item,
								id: item.id || getId(),
								timeout:
									typeof item.timeout === 'boolean' && item.timeout ? DEFAULT_TIMEOUT : item.timeout
							}
						]
					}
				}
			});
		},
	hideNotification:
		(id: string): Action =>
		(dispatch, getState) => {
			const state = getState();
			const list = state.notifications.list.filter((item) => item.id !== id);
			dispatch({
				type: 'EXTEND',
				payload: {
					notifications: {
						...state.notifications,
						list
					}
				}
			});
		},
	action:
		(item: UserNotification): Action =>
		(dispatch) => {
			const url = (item.subjects.project as Project)._id;
			if (item.type === 'new-project-application') {
				setRole(dispatch, 'employer');
				history.push(`/project/${url}`);
			}
			if (item.type === 'show-test') {
				setRole(dispatch, 'contractor');
				history.push(`/project/${url}`);
			}
			if (item.type === 'application-accept') {
				setRole(dispatch, 'contractor');
				history.push(`/project/${url}`);
			}
			if (item.type === 'application-reject') {
				setRole(dispatch, 'contractor');
				history.push(`/project/${url}`);
			}
			if (item.type === 'project-invite') {
				setRole(dispatch, 'contractor');
				history.push(`/project/${url}`);
			}
			if (item.type === 'project-for-contractor') {
				setRole(dispatch, 'contractor');
				history.push(`/project/${url}`);
			}
		}
};

function setRole(dispatch: ThunkDispatch<AppState>, role: RoleType): void {
	localStorage.setItem('role', role);
	dispatch({
		type: 'EXTEND',
		payload: {
			role
		}
	});
}

export default notificationActions;
