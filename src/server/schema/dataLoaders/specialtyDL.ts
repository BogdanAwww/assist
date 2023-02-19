import DataLoader from 'dataloader';
import {GraphQLResolveInfo} from 'graphql';
import {specialtyFindByIds} from '@/server/vendor/specialty/specialtyFindByIds';

export function specialtyDL(_ctx: any, _info: GraphQLResolveInfo) {
	return new DataLoader<string, any>(async (ids) => {
		const results = await specialtyFindByIds({ids});
		return ids.map((id) => results.find((x) => x._id.equals(id)));
	});
}
