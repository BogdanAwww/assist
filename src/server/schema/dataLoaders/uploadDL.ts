import DataLoader from 'dataloader';
import {GraphQLResolveInfo} from 'graphql';
import {uploadFindByIds} from '@/server/vendor/upload/uploadFindByIds';

export function uploadDL(_ctx: any, _info: GraphQLResolveInfo) {
	return new DataLoader<string, any>(async (ids) => {
		const results = await uploadFindByIds({ids});
		return ids.map((id) => results.find((x) => x._id.equals(id)));
	});
}
