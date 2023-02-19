import {ObjectTypeComposerFieldConfigDefinition} from 'graphql-compose';
import {resolveManyViaDL, resolveOneViaDL} from '@/server/schema/dataLoaders';
import {UploadTC} from '@/server/schema/entities/UploadTC';

export function getRelationUploadById(sourceFieldName: string): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => UploadTC,
		resolve: resolveOneViaDL('UploadID', (s) => s[sourceFieldName]),
		projection: {[sourceFieldName]: 1}
	};
}

export function getRelationUploadsByIds(sourceFieldName: string): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => [UploadTC],
		resolve: resolveManyViaDL('UploadID', (s) => s[sourceFieldName]),
		projection: {[sourceFieldName]: 1}
	};
}
