import {ObjectTypeComposerFieldConfigDefinition} from 'graphql-compose';
import {AuthTokenTC} from '@/server/schema/entities/AuthTokenTC';
import {resolveOneViaDL} from '@/server/schema/dataLoaders';

export function getRelationTokenById(sourceFieldName: string): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => AuthTokenTC,
		resolve: resolveOneViaDL('AuthTokenID', (s) => s[sourceFieldName]),
		projection: {[sourceFieldName]: 1}
	};
}
