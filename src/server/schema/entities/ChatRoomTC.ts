import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import {getRelationUsersByIds} from '../relations/user';
import {ChatMessageUTC, ChatMessageModel} from './ChatMessageTC';

const schema = new Schema({
	users: [{type: Schema.Types.ObjectId, ref: 'User'}],
	updateField: Number
});

schema.set('timestamps', true);

export const ChatRoomModel = mongoose.model('ChatRoom', schema);
export const ChatRoomTC = composeWithMongoose(ChatRoomModel);

ChatRoomTC.removeField(['updateField']);

ChatRoomTC.addFields({
	users: () => getRelationUsersByIds('users'),
	message: {
		type: ChatMessageUTC,
		resolve: async (source) => {
			const lastMessages = await ChatMessageModel.find({room: source._id}).sort({_id: -1}).limit(1);
			return lastMessages[0];
		}
	}
});
