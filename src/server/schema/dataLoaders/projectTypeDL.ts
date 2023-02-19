import DataLoader from 'dataloader';
import {GraphQLResolveInfo} from 'graphql';
import {PROJECT_TYPES} from '../entities/ProjectTypeTC';
import {Context} from '@/server/modules/context';

export function projectTypeDL(ctx: Context, _info: GraphQLResolveInfo) {
	return new DataLoader<string, any>(async (ids) => {
		const results = ids.reduce((acc, id) => {
			const type = PROJECT_TYPES[id];
			if (type) {
				return [...acc, {id, title: type[ctx.lang]}];
			}
			return acc;
		}, []);
		return ids.map((id) => results.find((x) => x.id === id));
	});
}
