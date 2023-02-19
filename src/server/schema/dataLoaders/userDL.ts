import DataLoader from 'dataloader';
import {GraphQLResolveInfo} from 'graphql';
import {userFindByIds} from '@/server/vendor/user/userFindByIds';
import {Context} from '@/server/modules/context';

export function userDL(ctx: Context, _info: GraphQLResolveInfo) {
	return new DataLoader<string, any>(async (ids) => {
		const results = await userFindByIds({ids}, ctx);
		return ids.map((id) => results.find((x) => x._id.equals(id)));
	});
}
