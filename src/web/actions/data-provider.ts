import apolloClient from '@/common/core/apollo-client/apollo-client';
import {wrapRequest} from '@/common/core/wrap-request';
import {CreatePortfolioProject, PortfolioProject} from '@/common/types/portfolio-project';
import {
	ApplicationsCount,
	CreateProject,
	InviteContractorInput,
	MyProjectsCount,
	Project,
	ProjectApplication,
	ProjectApplicationsCounter,
	ProjectApplicationsFilter,
	ProjectApply,
	ProjectType,
	QueryApplications,
	QueryApplicationsFilter,
	SearchProjectFilter,
	SearchProjectsCountOutput,
	SearchProjectsOutput
} from '@/common/types/project';
import {SpecialtyGroup} from '@/common/types/specialty';
import {
	City,
	Country,
	Viewer,
	UpdateUserSettings,
	SignupData,
	RestorePasswords,
	SearchContractorInput,
	SearchContractorOutput,
	PasswordChangeInput,
	User
} from '@/common/types/user';
import {PaginationInput, PaginationOutput} from '@/common/types';
import {UserNotification} from '@/common/types/notification';
import {Favorite} from '@/common/types/favorite';
import {Invoice} from '@/common/types/invoice';
import {PromoCode} from '@/common/types/promocode';
import {Upload, UploadType} from '@/common/types/upload';
import {CurrencyRates} from '@/common/types/common';

import SELF from './graphql/self.graphql';
import SIGNIN from './graphql/signin.graphql';
import SIGNOUT from './graphql/signout.graphql';
import SIGNUP from './graphql/signup.graphql';
import UPDATE_USER from './graphql/updateUser.graphql';
import CHANGE_PASSWORD from './graphql/changePassword.graphql';
import REQUEST_RESTORE_PASSWORD from './graphql/requestRestorePassword.graphql';
import RESTORE_PASSWORD from './graphql/restorePassword.graphql';
import VERIFY_ACCOUNT from './graphql/verifyAccount.graphql';
import REQUEST_VERIFICATION from './graphql/requestVerification.graphql';

import COUNTRIES from './graphql/countries.graphql';
import CITIES_BY_COUNTRY from './graphql/citiesByCountry.graphql';
import CITIES_BY_NAME from './graphql/citiesByName.graphql';
import PROJECT_TYPES from './graphql/projectTypes.graphql';
import SPECIALTY_GROUPS from './graphql/specialtyGroups.graphql';

import CREATE_PORTFOLIO_PROJECT from './graphql/createPortfolioProject.graphql';
import PORTFOLIO_PROJECTS from './graphql/portfolioProjects.graphql';
import PORTFOLIO_PROJECT from './graphql/portfolioProject.graphql';
import UPDATE_PORTFOLIO_PROJECT from './graphql/updatePortfolioProject.graphql';
import VIEW_PORTFOLIO_PROJECT from './graphql/viewPortfolioProject.graphql';
import DELETE_PORTFOLIO_PROJECT from './graphql/deletePortfolioProject.graphql';
import LOAD_THUMBNAIL from './graphql/loadThumbnail.graphql';

import CREATE_PROJECT from './graphql/createProject.graphql';
import MY_PROJECTS from './graphql/myProjects.graphql';
import MY_PROJECTS_COUNT from './graphql/myProjectsCount.graphql';
import PROJECT_ARCHIVE from './graphql/projectArchive.graphql';
import PROJECT_REMOVE from './graphql/projectDelete.graphql';
import SAVE_PROJECT from './graphql/saveProject.graphql';
import PROJECT_BOOST from './graphql/projectBoost.graphql';

import SEARCH_PROJECTS from './graphql/searchProjects.graphql';
import SEARCH_PROJECTS_COUNT from './graphql/searchProjectsCount.graphql';

import PROJECT from './graphql/project.graphql';

import PROJECT_APPLY from './graphql/projectApply.graphql';
import MY_APPLICATIONS from './graphql/myApplications.graphql';
import MY_APPLICATIONS_COUNT from './graphql/myApplicationsCount.graphql';

import SEARCH_CONTRACTOR from './graphql/searchContractor.graphql';

import USER from './graphql/user.graphql';

import INVITE_CONTRACTOR from './graphql/inviteContractor.graphql';

import PROJECT_APPLICATIONS from './graphql/projectApplications.graphql';
import PROJECT_APPLICATION from './graphql/projectApplication.graphql';
import SEEN_APPLICATION from './graphql/seenApplication.graphql';
import REJECT_APPLICATION from './graphql/rejectApplication.graphql';
import APPROVE_APPLICATION from './graphql/approveApplication.graphql';
import SEND_TEST from './graphql/sendTest.graphql';

import INVITE_FRIEND from './graphql/inviteFriend.graphql';

import NOTIFICATIONS from './graphql/notifications.graphql';
import SEEN_NOTIFICATIONS from './graphql/seenNotifications.graphql';

import FAVORITES from './graphql/favorites.graphql';
import FAVORITE from './graphql/favorite.graphql';

import PAY_SUBSCRIPTION from './graphql/paySubscription.graphql';

import RECOMMEND_USER from './graphql/recommendUser.graphql';

import GET_PROMO_CODE from './graphql/getPromoCode.graphql';
import SEND_METRICS from './graphql/sendMetrics.graphql';
import UPLOAD_FILE from './graphql/uploadFile.graphql';

import CURRENCY_RATES from './graphql/getCurrencyRates.graphql';

const signupUser = wrapRequest<Viewer, {input: SignupData}>(SIGNUP, {
	getVariables: ({input}) => ({input, data: localStorage.getItem('utms')})
});
const verifyAccount = wrapRequest<boolean, {hash: string}>(VERIFY_ACCOUNT);
const requestVerification = wrapRequest<boolean>(REQUEST_VERIFICATION);

const loadViewer = wrapRequest<Viewer>(SELF, {noCache: true});

const getCurrencyRates = wrapRequest<CurrencyRates>(CURRENCY_RATES, {noCache: true});

async function updateUser(userSettings: Partial<UpdateUserSettings> & {username: string}): Promise<Viewer | undefined> {
	const response = await apolloClient
		.mutate<{updateUser: Viewer}>({
			mutation: UPDATE_USER,
			variables: {input: userSettings},
			fetchPolicy: 'no-cache'
		})
		.catch((err) => {
			console.log(err);
			return undefined;
		});
	return response?.data?.updateUser;
}

async function requestRestorePassword(login: string): Promise<boolean> {
	const response = await apolloClient
		.mutate<{requestRestorePassword: boolean}>({
			mutation: REQUEST_RESTORE_PASSWORD,
			variables: {login},
			fetchPolicy: 'no-cache'
		})
		.catch(() => undefined);
	return Boolean(response?.data?.requestRestorePassword);
}

async function restorePassword(passwords: RestorePasswords & {hash: string}): Promise<boolean> {
	const response = await apolloClient
		.mutate<{restorePassword: boolean}>({
			mutation: RESTORE_PASSWORD,
			variables: passwords,
			fetchPolicy: 'no-cache'
		})
		.catch(() => undefined);
	return Boolean(response?.data?.restorePassword);
}

async function getCountries(): Promise<Country[]> {
	const response = await apolloClient.query<{countries: Country[]}>({query: COUNTRIES}).catch(() => undefined);
	const countries = (response?.data.countries || []).filter((country) => country.localeName);
	return countries.sort((a, b) => String(a.localeName).localeCompare(b.localeName));
}

async function getCitiesByCountry(countryId: string): Promise<City[]> {
	const response = await apolloClient
		.query<{citiesByCountry: City[]}>({
			query: CITIES_BY_COUNTRY,
			variables: {countryId}
		})
		.catch(() => undefined);
	const cities = (response?.data.citiesByCountry || []).filter((city) => city.localeName);
	return cities.sort((a, b) => a.localeName.localeCompare(b.localeName));
}

async function getSpecialtyGroups(): Promise<SpecialtyGroup[]> {
	const response = await apolloClient
		.query<{specialtyGroups: SpecialtyGroup[]}>({query: SPECIALTY_GROUPS})
		.catch(() => undefined);
	return response?.data.specialtyGroups || [];
}

const getProjectTypes = wrapRequest<ProjectType[]>(PROJECT_TYPES, {noCache: true});

function parsePortfolioProject(input: CreatePortfolioProject): any {
	return {
		...input,
		attachment: input.attachment?._id
	};
}

const createPortfolioProject = wrapRequest<PortfolioProject, {input: CreatePortfolioProject}>(
	CREATE_PORTFOLIO_PROJECT,
	{
		getVariables: ({input}) => ({input: parsePortfolioProject(input)})
	}
);

interface GetPortfolioFilter {
	author: string;
	specialty?: string;
}

async function getPortfolioProjects(filter: GetPortfolioFilter): Promise<PortfolioProject[]> {
	const response = await apolloClient
		.query<{portfolioProjects: PortfolioProject[]}>({
			query: PORTFOLIO_PROJECTS,
			variables: {filter},
			fetchPolicy: 'no-cache'
		})
		.catch(() => undefined);
	return response?.data.portfolioProjects || [];
}

const getPortfolioProject = wrapRequest<PortfolioProject, {id: string}>(PORTFOLIO_PROJECT, {noCache: true});
const updatePortfolioProject = wrapRequest<PortfolioProject, {id: string; input: CreatePortfolioProject}>(
	UPDATE_PORTFOLIO_PROJECT,
	{
		getVariables: ({id, input}) => ({id, input: parsePortfolioProject(input)})
	}
);
const viewPortfolioProject = wrapRequest<boolean, {id: string}>(VIEW_PORTFOLIO_PROJECT);
const deletePortfolioProject = wrapRequest<boolean, {id: string}>(DELETE_PORTFOLIO_PROJECT);
const getPortfolioThumbnail = wrapRequest<{thumbnail?: string; iframe?: string}, {url: string}>(LOAD_THUMBNAIL);

async function getCitiesByName(name: string): Promise<City[]> {
	const response = await apolloClient
		.query<{citiesByName: City[]}>({
			query: CITIES_BY_NAME,
			variables: {name},
			fetchPolicy: 'no-cache'
		})
		.catch(() => undefined);
	return response?.data.citiesByName || [];
}

function prepareReferencesInput(input: CreateProject): any[] {
	return input.references.map((item) => ({...item, upload: item.upload?._id}));
}

function prepareProjectInput({input, ...data}: {input: CreateProject} & {[x: string]: any}): any {
	return {
		...data,
		input: {
			...input,
			attachment: input.attachment?._id,
			references: prepareReferencesInput(input),
			test: {
				...input.test,
				file: input.test.file?._id
			}
		}
	};
}

const createProject = wrapRequest<Project, {input: CreateProject}>(CREATE_PROJECT, {getVariables: prepareProjectInput});
const saveProject = wrapRequest<Project, {id: string; input: CreateProject}>(SAVE_PROJECT, {
	getVariables: prepareProjectInput
});

const publishProject = wrapRequest<Project, {id: string}>(require('./graphql/publishProject.graphql'));

async function getMyProjects(status: string): Promise<Project[]> {
	const response = await apolloClient
		.query<{myProjects: Project[]}>({
			query: MY_PROJECTS,
			variables: {status},
			fetchPolicy: 'no-cache'
		})
		.catch(() => undefined);
	return response?.data.myProjects || [];
}

async function getMyProjectsCount(): Promise<MyProjectsCount> {
	const response = await apolloClient
		.query<{myProjectsCount: MyProjectsCount}>({
			query: MY_PROJECTS_COUNT,
			fetchPolicy: 'no-cache'
		})
		.catch(() => undefined);
	return (
		response?.data.myProjectsCount || {
			active: 0,
			draft: 0,
			archived: 0
		}
	);
}

const projectArchive = wrapRequest<boolean, {id: string}>(PROJECT_ARCHIVE);
const projectDelete = wrapRequest<boolean, {id: string}>(PROJECT_REMOVE);
const projectBoost = wrapRequest<boolean, {id: string}>(PROJECT_BOOST);

async function searchProjects(filter: SearchProjectFilter, page?: number): Promise<SearchProjectsOutput | undefined> {
	const response = await apolloClient
		.query<{searchProjects: SearchProjectsOutput}>({
			query: SEARCH_PROJECTS,
			variables: {filter, page},
			fetchPolicy: 'no-cache'
		})
		.catch(() => undefined);
	return response?.data.searchProjects || undefined;
}

async function searchProjectsCount(filter: SearchProjectFilter): Promise<SearchProjectsCountOutput | undefined> {
	const response = await apolloClient
		.query<{searchProjectsCount: SearchProjectsCountOutput}>({
			query: SEARCH_PROJECTS_COUNT,
			variables: {filter},
			fetchPolicy: 'no-cache'
		})
		.catch(() => undefined);
	return response?.data.searchProjectsCount || undefined;
}

async function getProject(id: string): Promise<Project | undefined> {
	const response = await apolloClient
		.query<{project: Project}>({
			query: PROJECT,
			variables: {id},
			fetchPolicy: 'no-cache'
		})
		.catch(() => undefined);
	return response?.data.project || undefined;
}

const projectApply = wrapRequest<ProjectApplication, {id: string; input: ProjectApply}>(PROJECT_APPLY, {
	getVariables: ({id, input}) => ({input: {...input, project: id}})
});

async function getMyApplications(
	filter: QueryApplicationsFilter,
	page?: number
): Promise<QueryApplications | undefined> {
	const response = await apolloClient
		.query<{myApplications: QueryApplications}>({
			query: MY_APPLICATIONS,
			variables: {filter, page},
			fetchPolicy: 'no-cache'
		})
		.catch(() => undefined);
	return response?.data.myApplications || undefined;
}

const getMyApplicationsCount = wrapRequest<ApplicationsCount>(MY_APPLICATIONS_COUNT, {noCache: true});

const searchContractor = wrapRequest<SearchContractorOutput, PaginationInput<SearchContractorInput>>(
	SEARCH_CONTRACTOR,
	{noCache: true}
);

const getPossibleContractors = wrapRequest<User[], {projectId: string}>(
	require('./graphql/getPossibleContractors.graphql'),
	{noCache: true}
);

const signin = wrapRequest<Viewer, {login: string; password: string}>(SIGNIN);
const signout = wrapRequest<undefined>(SIGNOUT);

const changePassword = wrapRequest<boolean, PasswordChangeInput>(CHANGE_PASSWORD);

const getUser = wrapRequest<User, {username: string}>(USER, {noCache: true});

const inviteContractor = wrapRequest<boolean, InviteContractorInput>(INVITE_CONTRACTOR, {
	getVariables: (input) => ({input})
});

const getProjectApplications = wrapRequest<
	PaginationOutput<ProjectApplication, ProjectApplicationsCounter>,
	PaginationInput<ProjectApplicationsFilter>
>(PROJECT_APPLICATIONS, {noCache: true});

const getProjectApplication = wrapRequest<ProjectApplication, {id: string}>(PROJECT_APPLICATION, {noCache: true});

const makeSeenApplication = wrapRequest<boolean, {id: string}>(SEEN_APPLICATION);
const rejectApplication = wrapRequest<boolean, {id: string}>(REJECT_APPLICATION);
const approveApplication = wrapRequest<boolean, {id: string}>(APPROVE_APPLICATION);

const sendTest = wrapRequest<boolean, {id: string}>(SEND_TEST);

const inviteFriend = wrapRequest<boolean, {email: string}>(INVITE_FRIEND);

const getNotifications = wrapRequest<PaginationOutput<UserNotification, {unread: number}>>(NOTIFICATIONS, {
	noCache: true,
	asArray: true,
	transform: (data) => {
		const items = data.items.map((item) => {
			const subjects = item.subjects.reduce((acc, subject) => {
				acc[subject.key] = subject.value || subject.original;
				return acc;
			}, {});
			return {...item, subjects};
		});
		return {...data, items};
	}
});

const seenNotifications = wrapRequest<boolean, {ids: string[]}>(SEEN_NOTIFICATIONS);

const getFavorites = wrapRequest<
	PaginationOutput<Favorite, {User: number; Project: number}>,
	{type: string; page?: number}
>(FAVORITES, {noCache: true});
const setFavorite = wrapRequest<boolean, {type: string; id: string; state: boolean}>(FAVORITE);

const paySubscription = wrapRequest<Invoice, {level: string; multiplier?: number; code?: string}>(PAY_SUBSCRIPTION);

const recommendUser = wrapRequest<User['recommendations'], {id: string}>(RECOMMEND_USER, {
	getVariables: ({id}) => ({id, status: true})
});

const getPromoCode = wrapRequest<PromoCode, {code: string}>(GET_PROMO_CODE, {noCache: true});
const sendMetrics = wrapRequest<any, {type: string; data: any}>(SEND_METRICS, {catch: true});

const uploadFile = wrapRequest<Upload<any>, {type: UploadType; file: File}>(UPLOAD_FILE, {context: {hasUpload: true}});

const isInFirstThousand = wrapRequest<boolean>(require('./graphql/isInFirstThousand.graphql'));

export {
	GetPortfolioFilter,
	signin,
	signout,
	changePassword,
	signupUser,
	verifyAccount,
	requestVerification,
	loadViewer,
	getCurrencyRates,
	updateUser,
	requestRestorePassword,
	restorePassword,
	getCountries,
	getCitiesByCountry,
	getCitiesByName,
	getProjectTypes,
	getSpecialtyGroups,
	createPortfolioProject,
	getPortfolioProjects,
	getPortfolioProject,
	updatePortfolioProject,
	viewPortfolioProject,
	deletePortfolioProject,
	getPortfolioThumbnail,
	createProject,
	getMyProjects,
	getMyProjectsCount,
	searchProjects,
	searchProjectsCount,
	projectArchive,
	projectDelete,
	saveProject,
	publishProject,
	projectBoost,
	getProject,
	projectApply,
	getMyApplications,
	getMyApplicationsCount,
	searchContractor,
	getPossibleContractors,
	getUser,
	inviteContractor,
	getProjectApplications,
	getProjectApplication,
	makeSeenApplication,
	rejectApplication,
	approveApplication,
	sendTest,
	inviteFriend,
	getNotifications,
	seenNotifications,
	getFavorites,
	setFavorite,
	paySubscription,
	recommendUser,
	getPromoCode,
	sendMetrics,
	uploadFile,
	isInFirstThousand
};
