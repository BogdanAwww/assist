import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import {PromoCodeTemplateModel, PromoCodeTemplateTC} from './PromoCodeTemplateTC';

const schema = new Schema({
	code: String,
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	template: {type: Schema.Types.ObjectId, ref: 'PromoCodeTemplate'},
	isUsed: {type: Boolean, default: () => false}
});

export const PromoCodeModel = mongoose.model('PromoCode', schema);
export const PromoCodeTC = composeWithMongoose(PromoCodeModel);

PromoCodeTC.removeField(['user', 'template']);

PromoCodeTC.addFields({
	promo: {
		type: () => PromoCodeTemplateTC,
		resolve: (s) => PromoCodeTemplateModel.findOne({_id: s.template}),
		projection: {template: 1}
	}
});
