import {Context} from '@/server/modules/context';
import {UserInputError} from 'apollo-server-express';
import {PortfolioProjectModel} from '../../entities/PortfolioProjectTC';
import {updateUserPortfolioCounter} from '@/server/vendor/user/updateUserCounter';

export default {
	type: 'Boolean',
	args: {
		id: 'String!'
	},
	resolve: async (_, {id}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const project = await PortfolioProjectModel.findOne({_id: id, author: user._id});
			if (!project) {
				throw new UserInputError('no project');
			}
			await project.remove();
			updateUserPortfolioCounter(user);
			return true;
		}

		return;
	}
};
