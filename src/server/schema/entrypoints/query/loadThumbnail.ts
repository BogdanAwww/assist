import {Context} from '@/server/modules/context';
import {getPortfolioThumbnail} from '@/server/vendor/portfolio-project/getPortfolioThumbnail';
import {PortfolioLinkDataOutput} from '../../types/outputs/project';

export default {
	type: PortfolioLinkDataOutput,
	args: {
		url: 'String'
	},
	resolve: async (_, {url}, ctx: Context) => {
		if (ctx.auth.getUser()) {
			return getPortfolioThumbnail(url);
		}
		return;
	}
};
