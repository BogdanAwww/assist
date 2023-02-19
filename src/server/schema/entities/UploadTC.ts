import path from 'path';
import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';

const IMAGE_EXTENSIONS = ['jpeg', 'png', 'jpg'];

const schema = new Schema({
	author: {type: Schema.Types.ObjectId, ref: 'User'},
	type: {type: String, enum: ['image', 'document']},
	key: String,
	format: String,
	url: String,
	urlTemplate: String
});

schema.virtual('filename').get(function (this: any) {
	return path.basename(this.url || '');
});

schema.virtual('isImage').get(function (this: any) {
	const ext = (path.extname(this.url || '') || '').slice(1);
	return IMAGE_EXTENSIONS.includes(ext);
});

export const UploadModel = mongoose.model('Upload', schema);
export const UploadTC = composeWithMongoose(UploadModel);

UploadTC.addFields({
	filename: 'String',
	isImage: 'Boolean'
});
