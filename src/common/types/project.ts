import {PaginationOutput} from '.';
import {Specialty} from './specialty';
import {DocumentUpload} from './upload';
import {City, User} from './user';
import {CurrencyType} from '@/web/utils/price-utils';

interface ProjectType {
	id: string;
	title: string;
}

enum ProjectPeriod {
	BEFORE = 'before',
	IN_DAY = 'inDay',
	AFTER = 'after',
	WHOLE = 'whole'
}

enum PaycheckType {
	SHIFT = 'shift',
	PROJECT = 'project',
	MONTH = 'month'
}

type ProjectStatus = 'draft' | 'active' | 'archived';

interface Project {
	_id: string;
	author: User;
	type: ProjectType;
	title: string;
	localeTitle?: string;
	description: string;
	localeDescription?: string;
	attachment?: DocumentUpload;

	specialties: Specialty[];
	location?: City;
	onlyPremium: boolean;

	period: ProjectPeriod;
	projectDate: number;
	endDate: number | undefined;
	hot: boolean;
	nonCommercial: boolean;
	budget: number;
	paycheck: {
		type: PaycheckType;
		amount: number;
		overtime: number;
		comment?: string;
		currency: CurrencyType;
	};

	references: ProjectReference[];
	test?: ProjectTest;
	hasTest: boolean;

	status?: ProjectStatus;
	applicationEst?: number;
	counters?: {
		applications: number;
	};
	application?: ProjectApplication;
	applicationsCounter?: ProjectApplicationsCounter;
	isFavorite?: boolean;

	createdAt?: number;
}

interface ProjectTest {
	description?: string;
	file?: DocumentUpload;
}

interface ProjectReference {
	description: string;
	example?: string;
	upload?: DocumentUpload;
}

interface CreateProjectTest {
	description?: string;
	file?: DocumentUpload | undefined;
}

interface CreateProject {
	type: string;
	title: string;
	description: string;
	attachment: DocumentUpload | undefined;

	specialties: string[];
	location?: string | undefined;
	onlyPremium: boolean;

	period: ProjectPeriod;
	projectDate: number;
	endDate: number | undefined;
	nonCommercial: boolean;
	budget: number;
	paycheck: {
		type: PaycheckType;
		amount: number;
		overtime: number;
		comment?: string;
	};

	references: ProjectReference[];
	test: CreateProjectTest;
}

interface MyProjectsCount {
	active: number;
	draft: number;
	archived: number;
}

interface SearchProjectFilter {
	type?: string;
	period?: ProjectPeriod;
	hideTest: boolean;
	nonCommercial: boolean;
	budgetFrom: number;
	paycheckType?: PaycheckType;
	paycheckAmount?: number;
	onlyPremium: boolean;
}

type SearchProjectsOutput = PaginationOutput<Project>;

interface SearchProjectsCountOutput {
	total: number;
	[ProjectPeriod.BEFORE]: number;
	[ProjectPeriod.IN_DAY]: number;
	[ProjectPeriod.AFTER]: number;
	[ProjectPeriod.WHOLE]: number;
}

interface ProjectApplication {
	_id: string;
	author: User;
	description: string;
	links: string[];
	budget: number;
	shiftCost: number;
	project: Project;
	showTest?: boolean;
	status?: 'active' | 'accepted' | 'rejected';
}

interface ProjectApply {
	description: string;
	links: string[];
	budget: number;
	shiftCost: number;
}

interface QueryApplicationsFilter {
	status: string;
}

type QueryApplications = PaginationOutput<ProjectApplication>;

interface ApplicationsCount {
	active: number;
	accepted: number;
	rejected: number;
}

interface InviteContractorInput {
	contractor: string;
	projects: string[];
}

interface ProjectApplicationsFilter {
	project: string;
	isUnread?: boolean;
	showTest?: boolean;
	status?: string;
}

interface ProjectApplicationsCounter {
	unread: number;
	seen: number;
	test: number;
	accepted: number;
}

export {
	PaycheckType,
	ProjectStatus,
	Project,
	ProjectType,
	ProjectPeriod,
	CreateProject,
	ProjectReference,
	MyProjectsCount,
	SearchProjectFilter,
	SearchProjectsOutput,
	SearchProjectsCountOutput,
	ProjectApplication,
	ProjectApply,
	QueryApplicationsFilter,
	QueryApplications,
	ApplicationsCount,
	InviteContractorInput,
	ProjectApplicationsFilter,
	ProjectApplicationsCounter
};
