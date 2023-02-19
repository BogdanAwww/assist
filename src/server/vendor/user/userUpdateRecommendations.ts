import {Schema} from 'mongoose';
import {UserModel} from '@/server/schema/entities/UserTC';
import {RecommendationModel} from '@/server/schema/entities/RecommendationTC';

interface RecommendationsData {
	count?: number;
	last: any[];
}

export async function userUpdateRecommendations(_id: Schema.Types.ObjectId): Promise<RecommendationsData | undefined> {
	return Promise.all([
		UserModel.findOne({_id}),
		RecommendationModel.find({subject: _id, isDeleted: false}).countDocuments(),
		RecommendationModel.find({subject: _id, isDeleted: false}).limit(5).sort({_id: -1})
	]).then(async ([user, count, last]) => {
		if (user) {
			const recommendations = {
				count,
				last: last.map((item) => item.get('user')).filter(Boolean)
			};
			user.set('recommendations', recommendations);
			await user.save();
			return {
				...recommendations,
				last: await UserModel.find({_id: {$in: recommendations.last}})
			};
		}
		return;
	});
}
