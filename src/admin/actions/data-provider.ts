import {wrapRequest} from '@/common/core/wrap-request';
import {PaginationInput, PaginationOutput} from '@/common/types';
import {Specialty, SpecialtyGroup} from '@/common/types/specialty';
import {User, Viewer} from '@/common/types/user';
import {Invoice} from '../types';
import {Project} from '@/common/types/project';

import SIGNIN from './graphql/signin.graphql';
import SIGNOUT from './graphql/signout.graphql';

import EDIT_SPECIALTY_GROUP from './graphql/editSpecialtyGroup.graphql';
import EDIT_SPECIALTY from './graphql/editSpecialty.graphql';

import IMPORT_USERS_FROM_XLSX from './graphql/importUsersFromXLSX.graphql';
import INVOICES from './graphql/invoices.graphql';

const signin = wrapRequest<Viewer, {login: string; password: string}>(SIGNIN);
const signout = wrapRequest<undefined>(SIGNOUT);

const getSpecialtyGroup = wrapRequest<SpecialtyGroup, {id: string}>(
	require('@/web/actions/graphql/specialtyGroup.graphql'),
	{noCache: true}
);

const getSpecialtyGroups = wrapRequest<SpecialtyGroup[]>(require('@/web/actions/graphql/specialtyGroups.graphql'), {
	noCache: true,
	asArray: true
});

const editSpecialtyGroup = wrapRequest<boolean, {id?: string; titles: Record<string, string>}>(EDIT_SPECIALTY_GROUP);

const getSpecialty = wrapRequest<Specialty, {id: string}>(require('@/web/actions/graphql/specialty.graphql'), {
	noCache: true
});

const editSpecialty = wrapRequest<
	boolean,
	{id?: string; group?: string; titles: Record<string, string>; isFrequentlyUsed: boolean}
>(EDIT_SPECIALTY);

const getUsers = wrapRequest<PaginationOutput<User>, PaginationInput<{}>>(require('./graphql/users.graphql'), {
	asArray: true
});

const getProjects = wrapRequest<PaginationOutput<Project>, PaginationInput<{}>>(require('./graphql/projects.graphql'), {
	asArray: true
});

interface ImportUsersOutput {
	total: number;
	prepared: number;
	skipped: number;
	inserted: number;
	errors: number;
}

const importUsersFromXLSX = wrapRequest<ImportUsersOutput, {id: string}>(IMPORT_USERS_FROM_XLSX);

const invoices = wrapRequest<PaginationOutput<Invoice>, PaginationInput<{}>>(INVOICES, {noCache: true});

export {
	signin,
	signout,
	getSpecialtyGroup,
	getSpecialtyGroups,
	editSpecialtyGroup,
	getSpecialty,
	editSpecialty,
	importUsersFromXLSX,
	getUsers,
	invoices,
	getProjects
};
