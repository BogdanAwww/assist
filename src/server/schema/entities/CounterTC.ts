import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';

const schema = new Schema({
	type: String,
	subject: {type: Schema.Types.ObjectId},
	counters: {type: Schema.Types.Map, of: Number}
});

export const CounterModel = mongoose.model('Counter', schema);
export const CounterTC = composeWithMongoose(CounterModel);
