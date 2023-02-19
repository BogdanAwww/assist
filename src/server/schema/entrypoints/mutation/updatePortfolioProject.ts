import {Context} from '@/server/modules/context';
import {getPortfolioThumbnail} from '@/server/vendor/portfolio-project/getPortfolioThumbnail';
import {userFindMany} from '@/server/vendor/user/userFindMany';
import {PortfolioProjectModel, PortfolioProjectTC} from '../../entities/PortfolioProjectTC';
import {CreatePortfolioProjectInput} from '../../types/inputs/portfolio-project';
import {handleTranslation} from '@/server/modules/translates';

export default {
	type: PortfolioProjectTC,
	args: {
		id: 'String!',
		input: CreatePortfolioProjectInput.NonNull
	},
	resolve: async (_, {id, input}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const project = await PortfolioProjectModel.findOne({_id: id, author: user.get('_id')});
			if (project) {
				const participants = input.participants || [];
				const users = await userFindMany({
					filter: {username: {$in: participants.map((user) => user.username).filter(Boolean)}}
				});
				const linkData = await getPortfolioThumbnail(input.link);
				await handleTranslation(input, 'title', 'title_en');
				await handleTranslation(input, 'description', 'description_en');
				await handleTranslation(input, 'responsibilities', 'responsibilities_en');
				project.set({
					...input,
					...linkData,
					participants: participants.map((participant) => {
						const user = users.find(
							(user) => ((user as any)?.username || user?.get('username')) === participant.username
						);
						return {
							...participant,
							user: user?._id
						};
					})
				});
				const updatedProject = await project.save();
				return updatedProject;
			}
		}

		return;
	}
};
