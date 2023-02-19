import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import {getRelationUserById} from '../relations/user';

const schema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	id: String,
	type: {type: String, enum: ['subscription', 'subscription_upgrade']},
	data: {},
	status: {
		type: String,
		enum: ['unused', 'paid', 'waiting', 'cancelled', 'error'],
		default: () => 'unused'
	}
});

schema.set('timestamps', true);

export const InvoiceModel = mongoose.model('Invoice', schema);
export const InvoiceTC = composeWithMongoose(InvoiceModel);

// InvoiceTC.removeField(['user']);
InvoiceTC.addFields({
	user: () => getRelationUserById('user')
});
