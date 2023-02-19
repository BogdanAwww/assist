import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import {getRelationNotificationSubjects} from '../relations/notification';

const schema = new Schema({
	type: String,
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	subjects: {
		type: Schema.Types.Map,
		of: {
			type: {type: String},
			id: {type: Schema.Types.ObjectId}
		}
	},
	isUnread: {type: Boolean, default: () => true},
	ts: {type: Number, default: () => new Date().getTime()}
});

export const NotificationModel = mongoose.model('Notification', schema);
export const NotificationTC = composeWithMongoose(NotificationModel);

NotificationTC.removeField('user');

NotificationTC.addFields({
	subjects: () => getRelationNotificationSubjects('subjects')
});
