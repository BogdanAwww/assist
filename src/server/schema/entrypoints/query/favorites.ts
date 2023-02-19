import {Context} from '@/server/modules/context';
import {preparePaginationResolverWithCounter} from '@/server/utils/pagination-utils';
import {favoriteFindMany} from '@/server/vendor/favorite/favoriteFindMany';
import {schemaComposer} from 'graphql-compose';
import {FavoriteTC} from '../../entities/FavoriteTC';
import {FavoritesFilterInput} from '../../types/inputs/favorite';
import {FavoritesCounterOutput} from '../../types/outputs/favorite';

function getFilter(user: any) {
	return {
		user: user._id,
		isDeleted: false
	};
}

const findManyResolver = schemaComposer.createResolver({
	name: 'favoritesMany',
	args: {
		filter: FavoritesFilterInput.NonNull,
		skip: 'Int',
		limit: 'Int'
	},
	async resolve({args: {filter, skip, limit}, context}: {args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			return favoriteFindMany({
				filter: {...filter, ...getFilter(user)},
				skip,
				limit
			});
		}
		return;
	}
});

const countResolver = schemaComposer.createResolver({
	name: 'favoritesCount',
	args: {
		filter: FavoritesFilterInput.NonNull
	},
	async resolve({args: {filter}, context}: {args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			return favoriteFindMany({
				filter: {...filter, ...getFilter(user)},
				count: true
			});
		}
		return;
	}
});

const counterResolver = schemaComposer.createResolver({
	type: FavoritesCounterOutput,
	name: 'favoritesCounter',
	args: {},
	async resolve({context}: {source: any; args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			const baseFilter = getFilter(user);
			return Promise.all([
				favoriteFindMany({
					filter: {...baseFilter, type: 'User'},
					count: true
				}),
				favoriteFindMany({
					filter: {...baseFilter, type: 'Project'},
					count: true
				})
			]).then(([User, Project]) => ({User, Project}));
		}
		return;
	}
});

export default preparePaginationResolverWithCounter(FavoriteTC, {
	findManyResolver,
	countResolver,
	counterResolver,
	name: 'pagination',
	perPage: 20
});
