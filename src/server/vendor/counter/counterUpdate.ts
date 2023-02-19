import {CounterModel} from '@/server/schema/entities/CounterTC';
import {Schema} from 'mongoose';

export async function counterUpdate(
	type: string,
	subject: Schema.Types.ObjectId | undefined,
	field: string,
	diff: number = 1
) {
	return CounterModel.updateOne({type, subject}, {$inc: {[`counters.${field}`]: diff}}, {upsert: true, new: true});
}
