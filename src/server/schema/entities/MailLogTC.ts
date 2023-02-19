import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';

const schema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	email: String,
	template: String,
	data: Schema.Types.Mixed,
	status: {type: String, enum: ['created', 'sent'], default: 'created'},
	mailgunId: String,
	ts: {
		type: Number,
		default: () => new Date().getTime()
	}
});

export const MailLogModel = mongoose.model('MailLog', schema);
export const MailLogTC = composeWithMongoose(MailLogModel);
