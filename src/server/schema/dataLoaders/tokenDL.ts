import DataLoader from 'dataloader';
import {GraphQLResolveInfo} from 'graphql';
import {authTokenFindByIds} from '@/server/vendor/authtoken/authTokenFindByIds';

export function authTokenDL(context: any, _info: GraphQLResolveInfo) {
	return new DataLoader<string, any>(async (ids) => {
		const results = await authTokenFindByIds({ids}, context);
		return ids.map((id) => results.find((x) => x._id.equals(id)) || new Error(`Token: no result for ${id}`));
	});
}
