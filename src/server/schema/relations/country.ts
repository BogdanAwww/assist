import {ObjectTypeComposerFieldConfigDefinition} from 'graphql-compose';
import {CountryTC} from '@/server/schema/entities/CountryTC';
import {resolveOneViaDL} from '@/server/schema/dataLoaders';

export function getRelationCountryById(sourceFieldName: string): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => CountryTC,
		resolve: resolveOneViaDL('CountryID', (s) => s[sourceFieldName]),
		projection: {[sourceFieldName]: 1}
	};
}
