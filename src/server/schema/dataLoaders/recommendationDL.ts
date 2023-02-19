import DataLoader from 'dataloader';
import {GraphQLResolveInfo} from 'graphql';
import {Context} from '@/server/modules/context';
import {RecommendationModel} from '../entities/RecommendationTC';
import {WebsocketContext} from '@/server/modules/pubsub';

export function recommendationDL(ctx: Context | WebsocketContext, _info: GraphQLResolveInfo) {
	return new DataLoader<string, any>(async (ids: any[]) => {
		const results = await RecommendationModel.find({
			user: 'auth' in ctx ? ctx.auth.getUser()?._id : ctx.user?._id,
			subject: {$in: ids},
			isDeleted: false
		});
		return ids.map((id) => Boolean(results.find((item) => item.get('subject').toString() === id.toString())));
	});
}
