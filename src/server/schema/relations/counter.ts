import {ObjectTypeComposerFieldConfigDefinition, schemaComposer} from 'graphql-compose';
import {upperFirst} from 'lodash';
import {CounterModel} from '../entities/CounterTC';

export function getRelationCounters<T extends string[]>(
	type: string,
	fields: T
): ObjectTypeComposerFieldConfigDefinition<any, any> {
	const CounterFieldTC = schemaComposer.createObjectTC({
		name: `${upperFirst(type)}Counter`,
		fields: fields.reduce((acc, field) => ({...acc, [field]: 'Int'}), {})
	});
	const defaultValues = fields.reduce((acc, field) => ({...acc, [field]: 0}), {});
	return {
		type: CounterFieldTC,
		resolve: async (source) => {
			const counter = await CounterModel.findOne({type, subject: source._id}).lean<{counters: any}>();
			return counter?.counters || defaultValues;
		},
		projection: {_id: 1}
	};
}
