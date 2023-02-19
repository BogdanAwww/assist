/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import DataLoader from 'dataloader';
import {GraphQLResolveInfo, GraphQLFieldResolver} from 'graphql';
import {authTokenDL} from './tokenDL';
import {cityDL} from './cityDL';
import {countryDL} from './countryDL';
import {specialtyDL} from './specialtyDL';
import {userDL} from './userDL';
import {projectDL, myProjectApplicationDL} from './projectDL';
import {uploadDL} from './uploadDL';
import {projectTypeDL} from './projectTypeDL';
import {favoriteDL} from './favoriteDL';
import {applicationDL} from './applicationDL';
import {recommendationDL} from './recommendationDL';

enum DataLoaderKind {
	OperationGlobal,
	FieldNode
}

type DLCfg =
	| {
			init: (context: any) => DataLoader<any, any>;
			kind: DataLoaderKind.OperationGlobal;
	  }
	| {
			init: (context: any, info: GraphQLResolveInfo) => DataLoader<any, any>;
			kind: DataLoaderKind.FieldNode;
	  };

const DataLoadersCfg = {
	// Global DataLoaders
	// ApprovalID: { init: approvalDLG, kind: DataLoaderKind.OperationGlobal } as DLCfg,
	// FieldNodes specific loaders
	// AccountID: { init: accountDL, kind: DataLoaderKind.FieldNode } as DLCfg,
	AuthTokenID: {init: authTokenDL, kind: DataLoaderKind.FieldNode} as DLCfg,
	CityID: {init: cityDL, kind: DataLoaderKind.FieldNode} as DLCfg,
	CountryID: {init: countryDL, kind: DataLoaderKind.FieldNode} as DLCfg,
	SpecialtyID: {init: specialtyDL, kind: DataLoaderKind.OperationGlobal} as DLCfg,
	UserID: {init: userDL, kind: DataLoaderKind.OperationGlobal} as DLCfg,
	ProjectID: {init: projectDL, kind: DataLoaderKind.OperationGlobal} as DLCfg,
	ProjectTypeID: {init: projectTypeDL, kind: DataLoaderKind.FieldNode} as DLCfg,
	UploadID: {init: uploadDL, kind: DataLoaderKind.FieldNode} as DLCfg,
	ApplicationID: {init: applicationDL, kind: DataLoaderKind.FieldNode} as DLCfg,
	MyProjectApplicationID: {init: myProjectApplicationDL, kind: DataLoaderKind.FieldNode} as DLCfg,
	IsFavorite: {init: favoriteDL, kind: DataLoaderKind.FieldNode} as DLCfg,
	IsRecommended: {init: recommendationDL, kind: DataLoaderKind.FieldNode} as DLCfg
};

type DataLoaderEntityNames = keyof typeof DataLoadersCfg;

/**
 * Get DataLoader instance, global o fieldNode specific
 */
export function getDataLoader(
	entityName: keyof typeof DataLoadersCfg,
	context: Record<string, any>,
	info: GraphQLResolveInfo
) {
	if (!context.dataLoaders) context.dataLoaders = new WeakMap();
	const {dataLoaders} = context;

	// determine proper key in Context for DataLoader
	const cfg = DataLoadersCfg[entityName];
	let contextKey: any;
	if (cfg.kind === DataLoaderKind.FieldNode) {
		// available for only current fieldNode
		contextKey = info.fieldNodes;
	} else {
		// available for all field levels
		contextKey = cfg;
	}

	// get or create DataLoader in GraphQL context
	let dl: DataLoader<any, any> = dataLoaders.get(contextKey);
	if (!dl) {
		dl = cfg.init(context, info);
		dataLoaders.set(contextKey, dl);
	}
	return dl;
}

/**
 * Create resolve method which loads many ids records via DataLoader
 * @example
 *   resolve: resolveOneViaDL('ContactID', (s) => s.authorId)
 */
export function resolveOneViaDL(
	entityName: DataLoaderEntityNames,
	idGetter: (s, a, c, i) => any
): GraphQLFieldResolver<any, any> {
	return (source, args, context, info) => {
		const id = idGetter(source, args, context, info);
		if (!id) return null;
		return getDataLoader(entityName, context, info).load(id);
	};
}

interface ResolveManyOptions {
	filter?: boolean;
}

/**
 * Create resolve method which loads many ids records via DataLoader
 * @example
 *   resolve: resolveManyViaDL('ContactID', (s) => s.authorIds)
 */
export function resolveManyViaDL(
	entityName: DataLoaderEntityNames,
	idsGetter: (s, a, c, i) => any[],
	options: ResolveManyOptions = {}
): GraphQLFieldResolver<any, any> {
	return (source, args, context, info) => {
		let ids = idsGetter(source, args, context, info);
		if (!ids) return [];
		if (!Array.isArray(ids)) ids = [ids];
		return getDataLoader(entityName, context, info)
			.loadMany(ids)
			.then((items) => (options.filter ? items?.filter(Boolean) : items));
	};
}
