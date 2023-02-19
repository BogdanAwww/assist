import {ProjectType} from './project';
import {Specialty} from './specialty';
import {DocumentUpload} from './upload';
import {User} from './user';

interface Participant {
	user?: User;
	name?: string;
	specialty?: Specialty;
}

interface PortfolioProject {
	_id: string | undefined;
	author: User;
	title: string;
	localeTitle: string;
	description?: string;
	localeDescription?: string;
	link?: string;
	attachment?: DocumentUpload;
	thumbnail?: string;
	iframe?: string;
	type: ProjectType;
	specialty: Specialty;
	responsibilities?: string;
	localeResponsibilities?: string;
	participants?: Participant[];
	views?: number;
}

interface ParticipantInput {
	username?: string;
	name?: string;
	specialty: string;
}

interface CreatePortfolioProject {
	title: string;
	description: string;
	link: string;
	attachment?: DocumentUpload;
	type: string;
	specialty: string | undefined;
	responsibilities: string;
	participants: ParticipantInput[];
}

export {PortfolioProject, Participant, CreatePortfolioProject, ParticipantInput};
