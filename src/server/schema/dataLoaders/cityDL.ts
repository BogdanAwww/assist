import DataLoader from 'dataloader';
import {GraphQLResolveInfo} from 'graphql';
import {cityFindByIds} from '@/server/vendor/city/cityFindByIds';

export function cityDL(_ctx: any, _info: GraphQLResolveInfo) {
	return new DataLoader<string, any>(async (ids) => {
		const results = await cityFindByIds({ids});
		return ids.map((id) => results.find((x) => x._id.equals(id)));
	});
}
