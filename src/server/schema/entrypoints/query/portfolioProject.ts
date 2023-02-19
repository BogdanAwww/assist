import {Context} from '@/server/modules/context';
import {portfolioProjectFindOne} from '@/server/vendor/portfolio-project/portfolioProjectFindOne';
import {PortfolioProjectTC} from '../../entities/PortfolioProjectTC';

export default {
	type: PortfolioProjectTC,
	args: {
		id: 'String!'
	},
	resolve: async (_, {id}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			return portfolioProjectFindOne({_id: id});
		}
		return;
	}
};
