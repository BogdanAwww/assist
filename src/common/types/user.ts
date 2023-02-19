import {PaginationOutput} from '.';
import {Specialty} from './specialty';
import {ImageUpload} from './upload';

type Avatar = Pick<ImageUpload, '_id' | 'urlTemplate'>;

interface Country {
	_id: string;
	localeName: string;
}

interface City {
	_id: string;
	localeName: string;
	localeFullName: string;
	country: Country;
}

interface Recommendations {
	count?: number;
	last?: User[];
}

interface User {
	_id: string;
	username: string;
	firstName: string;
	localeFirstname?: string;
	lastName: string;
	localeLastname?: string;
	fullName: string;
	localeFullname?: string;
	avatar?: Avatar;
	gravatar?: string;
	description?: string;
	localeDescription?: string;
	country?: Country;
	city?: City;
	email: string;
	phone?: string;
	website?: string;
	contacts?: string[];
	specialties?: Specialty[];
	isPremium?: boolean;
	isFavorite?: boolean;
	isVerified: boolean;
	subscription?: Subscription;
	isRecommended?: boolean;
	recommendations?: Recommendations;
	busy?: boolean;
	hasPortfolio?: boolean;
	modals?: any;
}

type SubscriptionLevel = 'start' | 'basic' | 'premium';

interface Subscription {
	level: SubscriptionLevel;
	end: number;
}

interface SubscriptionStats {
	quota: {
		projects: number;
		applications: number;
		boosts: number;
	};
	total: {
		projects: number;
		applications: number;
	};
}

interface Viewer extends User {
	verified: boolean;
	fullnessScore: number;
	hidePhone?: boolean;
	hideContacts?: boolean;
	subscriptionStats?: SubscriptionStats;
	demo?: boolean;
}

type EditUser = Pick<Viewer, 'firstName' | 'lastName' | 'description' | 'email' | 'phone' | 'website' | 'busy'>;

interface PasswordChangeInput {
	password: string;
	newPassword: string;
	newPassword2: string;
}

interface RestorePasswords {
	password: string;
	password2: string;
}

interface UpdateUserSettings extends EditUser {
	avatar?: string;
	country?: string;
	city?: string;
	contacts: string[];
	specialties: string[];
	hidePhone: boolean;
	hideContacts: boolean;
	isVerified?: boolean;
}

interface SignupData extends Pick<Viewer, 'firstName' | 'lastName' | 'email'> {
	password: string;
	password2: string;
	hash?: string;
	isAgree?: boolean;
}

interface SearchContractorInput {
	specialties: string[];
	location?: string;
	isPremium?: boolean;
}

interface Modals {
	isFirstSignIn?: boolean;
	isFirstPublishedProject?: boolean;
	isFirstAdviceInPortfolio?: boolean;
	firstProjectInPortfolio?: boolean;
	isFirstProjectsSearch?: boolean;
	isFirstProject?: boolean;
}

type SearchContractorOutput = PaginationOutput<User>;

export {
	SubscriptionLevel,
	User,
	Viewer,
	Avatar,
	Country,
	City,
	PasswordChangeInput,
	UpdateUserSettings,
	SignupData,
	RestorePasswords,
	SearchContractorInput,
	SearchContractorOutput,
	Modals
};
