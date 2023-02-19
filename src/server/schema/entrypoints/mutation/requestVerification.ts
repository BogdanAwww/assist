import {Context} from '@/server/modules/context';
import {sendVerification} from '@/server/vendor/user/sendVerification';
import {ApolloError, AuthenticationError} from 'apollo-server-express';
import {ActionConfirmModel} from '../../entities/ActionConfirmTC';

const VERIFICATION_TIMEOUT = 60 * 60 * 1000;

export default {
	type: 'Boolean',
	args: {},
	resolve: async (_, _args, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (!user) {
			throw new AuthenticationError('not authorized');
		}
		const lastVerification = await ActionConfirmModel.findOne({
			user: user._id,
			action: 'verify-account',
			isUsed: false
		});
		const now = new Date().getTime();
		const hasActiveVerification = lastVerification
			? lastVerification._id.getTimestamp() > now - VERIFICATION_TIMEOUT
			: false;
		if (hasActiveVerification) {
			throw new ApolloError('current verification is active', 'HAS_ACTIVE_VERIFICATION');
		}

		await sendVerification(user);

		return false;
	}
};
