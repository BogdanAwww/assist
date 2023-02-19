import {Context} from '@/server/modules/context';
import {UserTC} from '@/server/schema/entities/UserTC';
import {UserUpdateInput} from '@/server/schema/types/inputs/user';
import {updateFullnessScore} from '@/server/vendor/user/updateFullnessScore';
import {getSpecialtiesLimit} from '@/server/utils/user-utils';
import normalizeEmail from 'normalize-email';
import {handleTranslation} from '@/server/modules/translates';
import {UserModel} from '@/server/schema/entities/UserTC';

export default {
	type: UserTC,
	args: {
		input: UserUpdateInput.NonNull
	},
	resolve: async (_, {input}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if ((user && user.get('username') === input.username) || user.get('_role')) {
			const U = await UserModel.findOne({username: input.username});
			const update: any = input;
			if (input.contacts) {
				update.contacts = (input.contacts || []).filter(Boolean).slice(0, 3);
			}
			if (input.specialties) {
				const specialtiesLimit = getSpecialtiesLimit(user);
				update.specialties = (input.specialties || []).filter(Boolean).slice(0, specialtiesLimit);
			}
			if (input.email) {
				update.normalizedEmail = normalizeEmail(update.email);
			}
			await handleTranslation(input, 'firstName', 'firstname_en');
			await handleTranslation(input, 'lastName', 'lastname_en');
			await handleTranslation(input, 'description', 'description_en');
			console.log('UPDATE', U);
			U.set(update);
			updateFullnessScore(U);
			const updatedUser = await U.save();
			console.log('updatedUser', updatedUser);
			return updatedUser;
		}

		return;
	}
};
