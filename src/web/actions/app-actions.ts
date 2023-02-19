import {UserNotification} from '@/common/types/notification';
import {ThunkDispatch, Action as TAction} from '@/common/core/state/actions';
import AppState, {RoleType} from '../state/app-state';
import {Viewer} from '@/common/types/user';
import {
	getCountries,
	getNotifications,
	getProjectTypes,
	getSpecialtyGroups,
	loadViewer,
	seenNotifications,
	sendMetrics,
	signout,
	getCurrencyRates
} from './data-provider';
import apolloClient from '@/common/core/apollo-client/apollo-client';
import notificationManager from '@/common/core/notifications/notifications';
import messagesManager from '@/common/core/messages/messages';

type Action = TAction<AppState>;

const appActions = {
	initApp: (): Action => async (dispatch, getState) => {
		const viewer = await loadViewer().catch(() => undefined);
		updateViewer(dispatch, getState, viewer, {ready: true});
		getCurrencyRates().then((currencyRates) => {
			dispatch({
				type: 'DEEP_EXTEND',
				payload: {
					currencyRates
				}
			});
		});
	},
	setI18nReady: (): Action => ({
		type: 'DEEP_EXTEND',
		payload: {i18nReady: true}
	}),
	loadViewer: (): Action => async (dispatch, getState) => {
		const viewer = await loadViewer().catch(() => undefined);
		updateViewer(dispatch, getState, viewer);
	},
	setLoading:
		(isLoading: boolean): Action =>
		(dispatch) => {
			dispatch({
				type: 'EXTEND',
				payload: {isLoading}
			});
		},
	updateViewer:
		(viewer: Viewer): Action =>
		(dispatch, getState) => {
			updateViewer(dispatch, getState, viewer);
		},
	signout: (): Action => (dispatch) => {
		signout().finally(() => {
			apolloClient.clearStore();
		});
		localStorage.removeItem('create-project');
		localStorage.removeItem('token');
		localStorage.removeItem('role');
		notificationManager.disable();
		messagesManager.disable();
		dispatch({
			type: 'EXTEND',
			payload: {
				role: undefined,
				viewer: undefined,
				notifications: {list: []}
			}
		});
	},
	loadCountries: (): Action => async (dispatch, getState) => {
		const stateCountries = getState().countries;
		if (stateCountries.length === 0) {
			const countries = await getCountries().catch(() => []);
			dispatch({
				type: 'EXTEND',
				payload: {countries}
			});
		}
	},
	loadSpecialtyGroups: (): Action => async (dispatch, getState) => {
		const groups = getState().specialtyGroups;
		if (!groups || groups.length === 0) {
			const specialtyGroups = await getSpecialtyGroups().catch(() => []);
			dispatch({
				type: 'EXTEND',
				payload: {specialtyGroups}
			});
		}
	},
	loadProjectTypes:
		(force?: boolean): Action =>
		async (dispatch, getState) => {
			const types = getState().projectTypes;
			if (!types || types.length === 0 || force) {
				const projectTypes = await getProjectTypes().catch(() => []);
				dispatch({
					type: 'EXTEND',
					payload: {projectTypes}
				});
			}
		},
	updateNotifications:
		(id: string): Action =>
		async (dispatch, getState) => {
			const notifications = await updateNotifications(dispatch, getState);
			const item = notifications.items.find((el) => el._id === id);
			if (item?.type === 'application-accept') {
				dispatch({
					type: 'EXTEND',
					payload: {
						notificationDialog: {
							status: true,
							item: item || null
						}
					}
				});
			}
		},
	seenNotifications:
		(ids: string[]): Action =>
		async (dispatch, getState) => {
			seenNotifications({ids}).then(() => {
				updateNotifications(dispatch, getState);
			});
		},
	setRole:
		(role: RoleType, disableMetrics?: boolean): Action =>
		async (dispatch) => {
			localStorage.setItem('role', role);
			if (!disableMetrics) {
				sendMetrics({type: 'set-role', data: role});
			}
			dispatch({
				type: 'EXTEND',
				payload: {
					role
				}
			});
		},
	checkLayout: (): Action => async (dispatch) => {
		const width = document.body.offsetWidth;
		dispatch({
			type: 'EXTEND',
			payload: {
				isMobileLayout: width <= 768
			}
		});
	},
	showNotificationDialog:
		(status: boolean, item: UserNotification | null): Action =>
		(dispatch) => {
			dispatch({
				type: 'DEEP_EXTEND',
				payload: {
					notificationDialog: {
						status,
						item
					}
				}
			});
		}
};

function updateViewer(
	dispatch: ThunkDispatch<AppState>,
	getState: () => AppState,
	viewer?: Viewer,
	data?: Partial<AppState>
) {
	if (viewer && ENTRY === 'web') {
		notificationManager.enable();
		messagesManager.enable();
		updateNotifications(dispatch, getState);
	}
	dispatch({
		type: 'EXTEND',
		payload: {
			viewer,
			...data
		}
	});
}

function updateNotifications(dispatch: ThunkDispatch<AppState>, getState: () => AppState) {
	return getNotifications().then((data) => {
		notificationManager.notifyLoaded(data.items);
		const state = getState();
		dispatch({
			type: 'EXTEND',
			payload: {
				notifications: {
					...state.notifications,
					data
				}
			}
		});
		return data;
	});
}

export default appActions;
