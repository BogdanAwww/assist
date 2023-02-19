interface RestorePasswordData {
	link: string;
}

interface VerifyAccountData {
	link: string;
	password?: string;
}

interface ProjectInviteData {
	projectTitle: string;
	link: string;
}

interface ApplicationRejectData {
	projectTitle: string;
}

interface ApplicationAcceptData {
	projectTitle: string;
}

interface ShowTestData {
	projectTitle: string;
	link: string;
}

interface FriendInviteData {
	fullName: string;
	link: string;
}

interface SubscriptionLinkData {
	link: string;
}

interface SubsriptionExpirationData {
	level: string;
	date: string;
	link: string;
}

interface FirstRoleData {
	editProfileLink: string;
	addProjectLink: string;
	portfolioLink: string;
}

interface Promo70Data {
	code: string;
	link: string;
}

interface RememberVerifyData {
	link: string;
}

interface WelcomeVerifiedData {
	password: string;
}

interface DataTypes {
	'verify-account': VerifyAccountData;
	'verify-account-second': VerifyAccountData;
	'restore-password': RestorePasswordData;
	'project-invite': ProjectInviteData;
	'application-reject': ApplicationRejectData;
	'application-accept': ApplicationAcceptData;
	'show-test': ShowTestData;
	'friend-invite': FriendInviteData;
	'after-signup': {};
	'quota-exceeded-projects': SubscriptionLinkData;
	'quota-exceeded-applications': SubscriptionLinkData;
	'quota-exceeded-boosts': SubscriptionLinkData;
	'sub-expiration': SubsriptionExpirationData;
	'first-role-employer': FirstRoleData;
	'first-role-contractor': FirstRoleData;
	'promo-70': Promo70Data;
	'signin-problems': {};
	'remember-verify': RememberVerifyData;
	'welcome-verified': WelcomeVerifiedData;
	'project-application': {
		fullName: string;
		projectTitle: string;
		link: string;
	};
	'project-finished': {
		projectId: string;
		projectTitle: string;
	};
	'project-for-contractor': {
		projectTitle: string;
		link: string;
	};
	'unread-messages': {
		link: string;
	};
}

type TemplateType = keyof DataTypes;

type TemplateData<T extends TemplateType> = DataTypes[T];

export {TemplateType, TemplateData};
