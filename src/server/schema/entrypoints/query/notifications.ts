import {Context} from '@/server/modules/context';
import {preparePaginationResolverWithCounter} from '@/server/utils/pagination-utils';
import {notificationFindMany} from '@/server/vendor/notification/notificationFindMany';
import {schemaComposer} from 'graphql-compose';
import {NotificationTC} from '../../entities/NotificationTC';
import {NotificationsCounterOutput} from '../../types/outputs/notification';

const NOTIFICATION_TIME_LIMIT = 30 * 24 * 60 * 60 * 1000;

function getFilter(user: any) {
	const now = new Date().getTime() - NOTIFICATION_TIME_LIMIT;
	return {
		user: user._id,
		ts: {$gt: now}
	};
}

const findManyResolver = schemaComposer.createResolver({
	name: 'notificationsMany',
	args: {
		skip: 'Int',
		limit: 'Int'
	},
	async resolve({args: {skip, limit}, context}: {args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			return notificationFindMany({
				filter: getFilter(user),
				skip,
				limit
			});
		}
		return [];
	}
});

const countResolver = schemaComposer.createResolver({
	name: 'notificationsCount',
	args: {},
	async resolve({context}: {args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			return notificationFindMany({
				filter: getFilter(user),
				count: true
			});
		}
		return 0;
	}
});

const counterResolver = schemaComposer.createResolver({
	type: NotificationsCounterOutput,
	name: 'notificationsCounter',
	args: {},
	async resolve({context}: {source: any; args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			const baseFilter = getFilter(user);
			return Promise.all([
				notificationFindMany({
					filter: {...baseFilter, isUnread: true},
					count: true
				})
			]).then(([unread]) => ({unread}));
		}
		return {unread: 0};
	}
});

export default preparePaginationResolverWithCounter(NotificationTC, {
	findManyResolver,
	countResolver,
	counterResolver,
	name: 'pagination',
	perPage: 20
});
