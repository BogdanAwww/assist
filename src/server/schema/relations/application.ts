import {ObjectTypeComposerFieldConfigDefinition} from 'graphql-compose';
import {resolveOneViaDL} from '../dataLoaders';
import {ProjectApplicationTC} from '../entities/ProjectApplicationTC';

export function getRelationMyProjectApplicationByProject(
	sourceFieldName: string
): ObjectTypeComposerFieldConfigDefinition<any, any> {
	return {
		type: () => ProjectApplicationTC,
		resolve: resolveOneViaDL('MyProjectApplicationID', (s) => s[sourceFieldName]),
		projection: {[sourceFieldName]: 1}
	};
}
