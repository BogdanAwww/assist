import {Context} from '@/server/modules/context';
import {getPortfolioThumbnail} from '@/server/vendor/portfolio-project/getPortfolioThumbnail';
import {userFindMany} from '@/server/vendor/user/userFindMany';
import {PortfolioProjectModel, PortfolioProjectTC} from '../../entities/PortfolioProjectTC';
import {CreatePortfolioProjectInput} from '../../types/inputs/portfolio-project';
import {updateUserPortfolioCounter} from '@/server/vendor/user/updateUserCounter';

export default {
	type: PortfolioProjectTC,
	args: {
		input: CreatePortfolioProjectInput.NonNull
	},
	resolve: async (_, {input}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const participants = input.participants || [];
			const users = await userFindMany({
				filter: {username: {$in: participants.map((user) => user.username).filter(Boolean)}}
			});
			const linkData = await getPortfolioThumbnail(input.link);
			const project = new PortfolioProjectModel({
				...input,
				...linkData,
				author: user.get('_id'),
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
			updateUserPortfolioCounter(user);
			return updatedProject;
		}

		return;
	}
};
