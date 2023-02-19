import DataLoader from 'dataloader';
import {GraphQLResolveInfo} from 'graphql';
import {Context} from '@/server/modules/context';
import {favoriteFindMany} from '@/server/vendor/favorite/favoriteFindMany';

export function favoriteDL(context: Context, _info: GraphQLResolveInfo) {
	return new DataLoader<string, any>(async (data: any[]) => {
		const results = await favoriteFindMany({
			filter: {
				user: context.auth.getUser()?._id,
				subject: {$in: data.map((item) => item.subject)},
				isDeleted: false
			}
		});
		return data.map(({type, subject}) =>
			Boolean(results.find((x) => x.get('type') === type && x.get('subject').equals(subject)))
		);
	});
}
