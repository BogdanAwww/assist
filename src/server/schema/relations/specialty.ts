import {ObjectTypeComposerFieldConfigDefinition} from 'graphql-compose';
import {SpecialtyTC} from '@/server/schema/entities/SpecialtyTC';
import {resolveManyViaDL, resolveOneViaDL} from '@/server/schema/dataLoaders';
import {specialtyFindMany} from '@/server/vendor/specialty/specialtyFindMany';

export function getRelationSpecialtyById(sourceFieldName: string): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => SpecialtyTC,
		resolve: resolveOneViaDL('SpecialtyID', (s) => s[sourceFieldName]),
		projection: {[sourceFieldName]: 1}
	};
}

export function getRelationSpecialtiesByIds(
	sourceFieldName: string
): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => [SpecialtyTC],
		resolve: resolveManyViaDL('SpecialtyID', (s) => s[sourceFieldName].filter(Boolean), {filter: true}),
		projection: {[sourceFieldName]: 1}
	};
}

export function getRelationSpecialtiesByGroupId(
	sourceFieldName: string
): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => [SpecialtyTC],
		resolve: (s) => specialtyFindMany({group: s[sourceFieldName]}),
		projection: {[sourceFieldName]: 1}
	};
}
