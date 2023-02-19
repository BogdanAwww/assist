import {PromoCodeModel} from '@/server/schema/entities/PromoCodeTC';
import {PromoCodeTemplateModel} from '@/server/schema/entities/PromoCodeTemplateTC';
import {UserInputError} from 'apollo-server-errors';
import {Document} from 'mongoose';
import generator from 'password-generator';

interface Options {
	user: string;
	template: string;
}

const PROMOCODE_LENGTH = 10;

export async function createPromoCode(options: Options): Promise<Document | null> {
	const template = await PromoCodeTemplateModel.findOne({name: options.template}).lean<any>();
	if (!template) {
		throw new UserInputError('bad template');
	}

	const promo = new PromoCodeModel({
		code: template.prefix + generator(PROMOCODE_LENGTH - template.prefix.length, true),
		user: options.user,
		template: template._id
	});
	return promo.save();
}
