import {composeWithMongooseDiscriminators} from 'graphql-compose-mongoose';
import mongoose, {Schema, Document} from 'mongoose';
import {NumberType} from '../types/Scalars';
import {getRelationUserById} from '../relations/user';
import {Context} from '@/server/modules/context';
import {WebsocketContext} from '@/server/modules/pubsub';
import {getRelationUploadById} from '../relations/upload';
import {schemaComposer} from 'graphql-compose';

const schema = new Schema({
	room: {type: Schema.Types.ObjectId, ref: 'ChatRoom'},
	author: {type: Schema.Types.ObjectId, ref: 'User'},
	type: {type: String, enum: ['text', 'file'], default: 'text'},
	readBy: [{type: Schema.Types.ObjectId, ref: 'User'}]
});

schema.set('timestamps', true);
schema.set('discriminatorKey', 'type');

schema.index({
	content: 'text',
	content_en: 'text'
});

const textMessageSchema = new Schema({
	content: String,
	content_en: String
});

const fileMessageSchema = new Schema({
	file: {type: Schema.Types.ObjectId, ref: 'Upload'}
});

export const ChatMessageModel = mongoose.model('ChatMessage', schema);

export const ChatTextMessageModel = ChatMessageModel.discriminator('text', textMessageSchema);
export const ChatFileMessageModel = ChatMessageModel.discriminator('file', fileMessageSchema);

export const ChatMessageDTC = composeWithMongooseDiscriminators(ChatMessageModel);

const baseFields = {
	createdAt: NumberType,
	author: () => getRelationUserById('author'),
	isUnread: {
		type: 'Boolean',
		resolve: (source, _args, ctx: Context | WebsocketContext) => {
			const user = 'auth' in ctx ? ctx.auth.getUser() : ctx.user;
			if (user) {
				return isMessageUnread(source, user);
			}
			return false;
		}
	}
};

ChatMessageDTC.removeField(['readBy']);
ChatMessageDTC.addFields(baseFields);

export const ChatTextMessageTC = ChatMessageDTC.discriminator(ChatTextMessageModel, {name: 'ChatTextMessage'});

ChatTextMessageTC.removeField(['readBy']);
ChatTextMessageTC.addFields(baseFields);

export const ChatFileMessageTC = ChatMessageDTC.discriminator(ChatFileMessageModel, {name: 'ChatFileMessage'});

ChatFileMessageTC.removeField(['readBy']);
ChatFileMessageTC.addFields({
	...baseFields,
	file: () => getRelationUploadById('file')
});

export const ChatMessageUTC = schemaComposer.createUnionTC({
	name: 'ChatMessageUnion',
	types: ChatMessageDTC.childTCs,
	resolveType: (message) => {
		if (!message) {
			return;
		}
		if (message.type === 'text') {
			return 'ChatTextMessage';
		}
		if (message.type === 'file') {
			return 'ChatFileMessage';
		}
		return;
	}
});

function isMessageUnread(message: Document, user: Document): boolean {
	const userId = user._id.toString();
	const authorId = message.get('author').toString();
	const readBy = message.get('readBy') || [];
	return authorId === userId ? false : !readBy.find((id) => id.toString() === userId);
}
