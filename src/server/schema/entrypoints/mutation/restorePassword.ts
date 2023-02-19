import {Context} from '@/server/modules/context';
import {ActionConfirmModel} from '../../entities/ActionConfirmTC';
import {UserModel} from '../../entities/UserTC';
import Auth from '@/server/modules/auth';

export default {
	type: 'Boolean',
	args: {
		password: 'String!',
		password2: 'String!',
		hash: 'String!'
	},
	resolve: async (_, {password, password2, hash}, _ctx: Context) => {
		if (password === password2) {
			const confirmation = await ActionConfirmModel.findOne({hash, isUsed: false});
			if (confirmation && confirmation.get('expire') > Number(new Date())) {
				const user = await UserModel.findOne({_id: confirmation.get('user')});
				if (user) {
					const passwordHash = await Auth.hashPassword(password);
					user.set('password', passwordHash);
					await user.save();
					confirmation.set('isUsed', true);
					await confirmation.save();
					return true;
				}
			}
		}

		return false;
	}
};
