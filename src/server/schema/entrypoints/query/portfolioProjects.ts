import {Context} from '@/server/modules/context';
import {portfolioProjectFindMany} from '@/server/vendor/portfolio-project/portfolioProjectFindMany';
import {PortfolioProjectTC} from '../../entities/PortfolioProjectTC';
import {PortfolioProjectsFilter} from '../../types/inputs/portfolio-project';

export default {
	type: [PortfolioProjectTC],
	args: {
		filter: PortfolioProjectsFilter.NonNull
	},
	resolve: async (_, {filter}, _ctx: Context) => {
		if (filter.author) {
			return portfolioProjectFindMany(filter);
		}
		return [];
	}
};
