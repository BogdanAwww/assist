import DataLoader from 'dataloader';
import {GraphQLResolveInfo} from 'graphql';
import {projectFindByIds} from '@/server/vendor/project/projectFindByIds';
import {projectApplicationFindMany} from '@/server/vendor/project-application/projectApplicationFindMany';
import {Context} from '@/server/modules/context';

export function projectDL(_ctx: any, _info: GraphQLResolveInfo) {
	return new DataLoader<string, any>(async (ids) => {
		const results = await projectFindByIds({ids});
		return ids.map((id) => results.find((x) => x._id.equals(id)));
	});
}

export function myProjectApplicationDL(ctx: Context, _info: GraphQLResolveInfo) {
	return new DataLoader<string, any>(async (ids) => {
		const user = ctx.auth.getUser();
		const results = await projectApplicationFindMany({
			filter: {
				author: user?._id,
				project: {$in: ids}
			}
		});
		return ids.map((id) => results.find((x) => x.get('project').equals(id)));
	});
}
