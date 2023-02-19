import billing from '@/server/modules/billing';
import {Context} from '@/server/modules/context';
import {InvoiceTC} from '../../entities/InvoiceTC';

export default {
	type: InvoiceTC,
	args: {
		level: 'String',
		multiplier: 'Int',
		code: 'String'
	},
	resolve: async (_, {level, multiplier, code}, ctx: Context) => {
		const user = ctx.auth.getUser();
		// const isAdmin = Boolean(user?.get('_role') === 'admin');
		// if (isProduction && !isAdmin) {
		// 	return;
		// }
		if (user) {
			return billing.createSubscriptionInvoice({userId: user._id, level, multiplier, code}, ctx);
		}

		return;
	}
};
