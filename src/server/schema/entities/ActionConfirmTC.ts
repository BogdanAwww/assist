// import { composeWithMongoose } from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import generator from 'password-generator';

const schema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	action: String,
	hash: {type: String, default: () => generator(16, false)},
	expire: Number,
	isUsed: {type: Boolean, default: () => false}
});

export const ActionConfirmModel = mongoose.model('ActionConfirm', schema);
// export const ActionConfirmTC = composeWithMongoose(ActionConfirmModel);
