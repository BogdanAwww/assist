import {Context} from '@/server/modules/context';
import {userUpdateRecommendations} from '@/server/vendor/user/userUpdateRecommendations';
import {RecommendationModel} from '../../entities/RecommendationTC';
import {UserRecommendOutput} from '../../types/outputs/user';

export default {
	type: UserRecommendOutput,
	args: {
		id: 'String!',
		status: 'Boolean!'
	},
	resolve: async (_, {id, status}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user && user._id.toString() !== id) {
			const result = await RecommendationModel.updateOne(
				{user: user._id, subject: id},
				{isDeleted: !status},
				{upsert: true}
			);
			if (result?.nModified || result.upserted) {
				return userUpdateRecommendations(id);
			}
		}

		return;
	}
};
