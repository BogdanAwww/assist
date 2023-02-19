import {Context} from '@/server/modules/context';
import {PortfolioProjectModel} from '../../entities/PortfolioProjectTC';

export default {
	type: 'Boolean',
	args: {
		id: 'String'
	},
	resolve: async (_, {id}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const project = await PortfolioProjectModel.findOne({_id: id});
			if (project && project.get('author') !== user.get('_id')) {
				return PortfolioProjectModel.updateOne({_id: id}, {$inc: {views: 1}}).then(Boolean);
			}
		}

		return;
	}
};
