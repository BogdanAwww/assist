import DataLoader from 'dataloader';
import {GraphQLResolveInfo} from 'graphql';
import {projectApplicationFindMany} from '@/server/vendor/project-application/projectApplicationFindMany';
import {Context} from '@/server/modules/context';

export function applicationDL(_ctx: Context, _info: GraphQLResolveInfo) {
	return new DataLoader<string, any>(async (ids) => {
		const results = await projectApplicationFindMany({
			filter: {
				_id: {$in: ids}
			}
		});
		return ids.map((id) => results.find((x) => x._id.equals(id)));
	});
}
