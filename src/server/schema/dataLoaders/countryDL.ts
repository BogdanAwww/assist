import DataLoader from 'dataloader';
import {GraphQLResolveInfo} from 'graphql';
import {countryFindByIds} from '@/server/vendor/country/countryFindByIds';

export function countryDL(_ctx: any, _info: GraphQLResolveInfo) {
	return new DataLoader<string, any>(async (ids) => {
		const results = await countryFindByIds({ids});
		return ids.map((id) => results.find((x) => x._id.equals(id)));
	});
}
