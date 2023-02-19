import {ObjectTypeComposerFieldConfigDefinition} from 'graphql-compose';
import {CityTC} from '@/server/schema/entities/CityTC';
import {resolveOneViaDL} from '@/server/schema/dataLoaders';

export function getRelationCityById(sourceFieldName: string): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => CityTC,
		resolve: resolveOneViaDL('CityID', (s) => s[sourceFieldName]),
		projection: {[sourceFieldName]: 1}
	};
}
