import mongoose, {Schema} from 'mongoose';

const schema = new Schema({
	version: Number,
	rate: {}
});

export const SystemModel = mongoose.model('System', schema);
