import type {Translates} from './ru';

type TranslationObject<T extends Record<string, any>> = {
	[K in keyof T]: T[K] extends string ? string : T[K] extends string[] ? string[] : TranslationObject<T[K]>;
};

type TT = TranslationObject<Translates>;

export const translates: TT = {
	header_employer: 'Need a Talent',
	header_contractor: 'Need a Gig',
	header_hint:
		'As a contractor you can search for projects, as a employer you can find contractors in your projects.',
	header_buttonHint: 'You can invite him to the project or save to bookmarks',

	findProject: 'Find Project',
	findContractor: 'Find a Talent',
	myApplications: 'My Applications',
	myProjects: 'My Projects',

	search: 'Search',
	portfolio: 'Portfolio',
	settings: 'Settings',
	exit: 'Exit',
	employer: 'Employer',
	contractor: 'Contractor',
	location: 'Location',
	contacts: 'Contacts',
	available: 'Available',
	projects: 'Projects',
	applications: 'Applications',
	total: 'Total',
	prolong: 'Upgrade',
	change: 'Change',
	only: 'Only',
	link: 'Link',
	or: 'Or',
	add: 'Add',
	title: 'Title',
	describe: 'Describe',
	termless: 'Termless',
	nonComercial: 'Non-commercial',
	payment: 'Payment',
	references: 'References',
	back: 'Back',
	cancel: 'Cancel',
	preview: 'Preview',
	next: 'Next',
	save: 'Save',
	publish: 'Publish',
	continue: 'Continue',
	active: 'Active',
	drafts: 'Drafts',
	archived: 'Archived',
	users: 'Users',
	chats: 'Chats',
	file: 'File',
	common: 'General information',
	speciality: 'Speciality',
	password: 'Password',
	subscription: 'Subscription',
	your: 'Your',
	saved: 'Сохранено',
	surname: 'Surname',
	name: 'Name',
	country: 'Country',
	city: 'City',
	email: 'Email',
	phoneNumber: 'Phone number',
	site: 'Site',
	month: 'Month',
	year: 'Year',
	free: 'Free',
	promocode: 'Promocode',
	apply: 'Apply',
	buy: 'Buy',
	contractors: 'Contractors',

	searchParameters: 'Search parameters',
	searchParametersSubtitle: 'Projects are selected based on the specialties specified in the profile.',
	tariffUntil: 'Plan until',
	projectType: 'Project type',
	raiseToTheTop: 'Raise to the top',
	noTariffSelected: 'No plan selected',
	whatProjectDoYouWantToFind: 'What project do you want to find',
	employerMyProjectsFishText: `Publishing a project allows you to select performers specifically for your project.
    You can also use the talent search function, indicating all the necessary criteria.
    Browse artists and save them to Favorites for future projects.
    If you have any questions, please write to us at support@assist.video.`,
	dontShowPorjectWithTest: 'Do not show projects with a test item',
	nonCommercialProjects: 'Non-commercial projects',
	nonCommercialProjectsHint: `A non-commercial project is a project of any genre, on the production of which the personal funds of the creators are spent. Its goal is to convey to the viewer a thought or idea without the desire to earn money or without the possibility of realizing it.
    What does this mean for you? The fact that this is either a low-budget or unpaid project, where you can experiment, find a new team, add an interesting project to your portfolio, take part in festivals, get credits and other significant recognition. These projects are often very interesting and important!`,
	budgetFrom: 'Budget from',
	projectBudget: 'Project budget',
	paymentForPeriod: 'Payment for period',
	paymentFrom: 'Payment from',
	uploadFile: ['Drag the file here', 'or', 'choose file from', 'computer', 'device'],
	nameOfTheProperty: 'Name of the property',
	referencesDialogFirstPlaceholder: 'For example, "I want a color like this"',
	referencesDialogSecondPlaceholder: 'Link to your reference',
	uploadFileSingle: 'Upload file',
	projectFile: 'Project file',
	projectFileHint:
		'Here you can attach a script file, logline, synopsis, treatment, terms of reference, storyboard or other details of the project for a potential performer to review.',
	whoAreYouLooking: 'Who are you looking for for the project?',
	employmentPeriod: 'Employment period',
	contractorLocation: 'Contractor location',
	nameOfTheCity: 'Enter the name of the city',
	shootingDate: 'Shooting date',
	shootingDateHint:
		'The project will automatically end on the day filming starts, if you do not indicate the number of active days after the publication of the project',
	relevanceRequest: 'Relevance of the request',
	relevanceRequestHint: 'How long does it take to accept applications after the publication of the project?',
	'7days': '7 days',
	'14days': '14 days',
	nonCommercialHint: `A non-commercial project is a project of any genre, on the production of which the personal funds of the creators are spent. Its goal is to convey to the viewer a thought or idea without the desire to earn money or without the possibility of realizing it.
	What does this mean for you? The fact that this is either a low-budget or unpaid project, where you can experiment, find a new team, add an interesting project to your portfolio, take part in festivals, get credits and other significant recognition. These projects are often very interesting and important!`,
	paymentPeriod: 'Payment for the period',
	paymentForOvertime: 'Overtime payment',
	paymentComment: 'Payment comment',
	referencesHint:
		'Add links or attach photos, videos and other supporting materials describing the style, format and other preferences that need to be implemented in the project. Such references will help to more accurately convey your idea and vision of the final product.',
	addReference: 'Add reference',
	test: 'Test',
	projectEditing: 'Editing a project',
	creatingNewProject: 'Create a project',
	createHint:
		'Fill in the information about the project and those who fit the parameters and are ready to start work will respond to it.',
	createProject: 'Create project',
	yourNewProject: 'Your new project',
	saveToDraft: 'Save to draft',
	publicationRejected: 'Publication of the project was rejected',
	publicationRejectedDescribe: `You do not have a subscription or you have exceeded the subscription limit. To publish a project buy or
	renew your subscription.`,
	projectAddCongratulation: [
		'CONGRATULATIONS! YOU PUBLISHED A PROJECT.',
		'A FEW RECOMMENDATIONS ON THE CHOICE OF THE CONTRACTOR',
		'Carefully review the contractor profile',
		'Contact the contractor via chat',
		'Ask to do a test task',
		'Assess technical and communication skills',
		'Clearly state your requirements and expected results'
	],
	favoritesFishText: 'The list of bookmarks is empty.',
	latestNotifications: 'Latest notifications',
	notificationsListEmpty: 'The notification list is empty.',
	supportDialog: [
		'Have a problem?',
		'If you have difficulties using the service, you can write to us in',
		'the Telegram bot',
		'or send a letter to',
		'support@assist.video'
	],
	nothingFound: 'Nothing found',
	errorWhenFindMessage: 'An error occurred while searching for messages.',
	searchMessage: 'Search for a message',
	settingsFullness: [
		'Profile completed on',
		'For your profile to participate in the search, please fill in all sections.',
		' You can be found in the search.'
	],
	settingsHint: 'Fill in the data',
	subscriptionHint: 'Fill out your portfolio to show priority in the search',
	profileLink: 'Profile link',
	settingsContent: [
		'When you create a profile in Assist, you can be on the platform both as an executor and as a customer.',
		'To change your status, simply flip the toggle switch to the desired position in the upper right corner.'
	],
	commonInformation: 'Common information',
	savedError: 'Failed to save settings',
	changeAvatar: 'Change avatar',
	aboutMyself: 'About myself',
	chooseCountry: 'ChooseCountry',
	iamBusy: 'I am busy',
	iamBusyDisclaimer: 'If you select this option, you will not be able to invite to projects.',
	saveChanges: 'Save changes',
	chooseSpeciality: 'Choose speciality',
	specialityWarning: 'The number of specialties can be increased by improving the subscription.',
	hidePhoneNumber: 'Hide phone number',
	additionalLinks: 'Additional links',
	contactInformation: 'Contact Information',
	passwordChanged: 'Password changed successfully',
	changePassword: 'Change password',
	lastPassword: 'Last password',
	newPassword: 'New password',
	confirmPassword: 'Confirm the password',
	errorHasOccured: 'An error has occurred.',
	yourTarif: 'Your plan',
	chooseTarif: 'Choose plan',
	validUntil: 'Valid until',
	subscriptionWarnings: [
		'You need to purchase a subscription to access the service.',
		'Payment is temporarily unavailable, we will inform you when it becomes possible to pay for the subscription',
		'You can get acquainted with contact information, payment rules, security of payments, confidentiality of information, rules of return and delivery of goods by',
		'link',
		'* Payment is made in KZT (Kazakhstani tenge) currency.'
	],
	subscriptionDisclaimer: '!Search for performers only through the publication of the project',
	addProjectToPortfolio: 'Add project to portfolio',
	projectName: 'Project name',
	projectNameHint: 'For example, for the film, its name is "Die Hard"',
	fewWordsAboutProject: 'A few words about the project',
	addLinkToProject: 'Add a link to your project',
	orAddFile: 'Or add file',
	ifWorkNotVideo: 'if your work is not a video',
	chooseFile: 'Choose file',
	whatDidYouDo: 'What did you do on the project',
	whatDidYouDoDisclaimer: 'The tasks that were before you',
	projectParticipants: 'Project participants',
	projectParticipantsHint: 'Who in the team was this project made with?',
	noParticipants: 'There are no participants.',
	contractorProfile: 'Artist profile',
	profileLinkOrId: 'Profile link or ID',
	addMember: 'Add member',
	projectLooksForOther: 'This is how your project looks for other users',
	editProjectInPortfolio: 'Edit project in portfolio',
	newProjectInPortfolio: 'New project in portfolio',
	contractorLocationHint: 'Without specifying the location, performers from any city will be selected.',
	contractorSearchFishText: [
		'To find the best performers',
		'1) Indicate the specialty that interests you.',
		'2) Select a location or leave the field blank if you are interested \n' +
			'\t\t\t\t\t\t\t\t\t remote work format.',
		'3) Select an account type.',
		'4) Happy search!',
		'5) If you have any questions - write to us in the chat or email support@assist.video.'
	],
	contractorSearchWarning: 'Search is not available for your subscription level.',
	contractorSearchUnsuccessful:
		'No contractors were found for your request. Please try changing your search criteria. ',
	faqTitle: 'Frequently Asked Questions',
	faqBottomLabel: "Didn't find the answer to your question?",
	faqWriteToUs: 'Write to us',
	faqDialog: [
		'WE WILL BE GLAD TO HELP YOU. WRITE YOUR QUESTIONS. ',
		'Question subject',
		'For example "Payment" ',
		'Question',
		'Your question',
		'Send',
		'YOUR MESSAGE SENT',
		'The answer will be sent to you in the mail that is attached to your account'
	],
	faqSearch: ['Enter a question or keyword', 'Your question'],
	portfolioEditDialog: [
		'CONGRATULATIONS ON THE FIRST PUBLISHED WORK!',
		'Having your work in the portfolio allows you to appear in the search for specialists and increases the chances \n' +
			'\t\t\t\t\t to choose you as the artist.',
		'EXPAND YOUR PORTFOLIO!',
		'Add jobs for each specialty',
		'Fill in a description for your project',
		'Indicate what exactly you did on the project'
	],
	portfolioListDialog: [
		'Welcome to Platform Assist.',
		'It is very important for us, as well as for you, that you find a project to your liking. Therefore, together \n ' +
			'\t\t\t\t\t\t it is necessary to create ideal conditions for customers so that they constantly come to us with \n' +
			'\t\t\t\t\t\t new projects. To do this, the fullness of your portfolio should be maximum! ',
		'Be responsible for creating your portfolio! For each specified specialty \n ' +
			'\t\t\t\t\t\t publish at least one work, add a customer recommendation to it, create a showreel \n' +
			'\t\t\t\t\t\t for a quick look at your skills. The presence of works in the portfolio will automatically add yours \n ' +
			'\t\t\t\t\t\t top profile.',
		"Don't forget that every three months we run a competition for the best portfolio.",
		'Thank you for being with us!',
		'Command Assist.'
	],
	projectSearchDialog: [
		'FIND A PROJECT FOR YOU!',
		'What to do to get you chosen',
		'Answer the request immediately;',
		'Submit your best work in a portfolio;',
		'Check out the project requirements;',
		'Describe why you should be chosen;',
		'Be polite to the customer;',
		'Be punctual.'
	],
	fullnessWarningDialog: [
		'Low profile occupancy',
		'Your profile has been completed on',
		'To fully use the platform please fill in all marked sections in \n' + '\t\t\t\t\t\t\t settings.',
		'Go'
	],
	logout: 'Exit now',
	copyright: 'All rights reserved',
	pay: 'Pay',
	discount: 'discount',
	choosePaymentType: 'Choose period',
	notifications: {
		promocodeActivated: 'Promocode activated.',
		promocodeInvalid: 'Invalid promocode.',
		promocodeInvalidSubscription: 'You can use this promocode on subscription plan "%level".',
		promocodeAlreadyUsed: 'Promocode alread used.',
		promocodeUserHasSubscription: 'Active subscription exists.',
		contractorApproved: 'Contractor approved.',
		projectRaised: 'Project raised to the top.',
		inviteSent: 'Invite sent.',
		forgotPasswordSent: 'Email with password sent to your mail.',
		tryAgainLater: 'Try again later.',
		youAreContractor: 'You have been chosen as contractor.',
		needAuth: 'To fully access Assist service you need authorize.',
		passwordChanged: 'Password successfully changed.',
		'new-project-application': '%user applied to project «%project»',
		'show-test': 'You have test for a project «%project»',
		'application-accept': 'You have been chosen as contractor for project «%project», employer will contact you',
		'application-reject': 'Your application to project «%project» rejected',
		'project-invite': 'You have been invited to participate in project «%project»',
		'project-for-contractor': 'We found project for you: «%project»'
	},
	chooseRole: {
		welcome: 'Welcome to our platform.',
		chooseRole: 'Please choose one of the following:',
		employerContinueAs: 'I need to',
		employerText: 'Hire',
		employerDescription: 'Select this option if you are looking for a talent to produce content',
		contractorContinueAs: 'I am looking for a',
		contractorText: 'Project',
		contractorDescription: 'Select this option if you are looking for a new gig.',
		verification: {
			disclaimer: 'Please verify your email address. Check your email and click link.',
			sendAgain: 'Send again',
			mailSent: 'Verification sent. Please check your mail.',
			mailAlreadySent: 'Verification already has been sent recently. You can try again later.'
		}
	},
	backgroundMain: {
		text: 'Together we are the greatest filmmakers community of all times!'
	},
	budget: 'Budget',
	nonCommercialProject: 'Non commersial project',
	newMany: 'New',
	seen: 'Seen',
	applicationTime: 'Until',
	projectPeriodLabels: {
		before: 'Pre-production',
		inDay: 'Production',
		after: 'Post-production',
		whole: 'Entire project',
		all: 'All projects'
	},
	paycheckType: {
		shift: 'shift',
		project: 'project',
		month: 'month'
	},
	finished: 'Finished',
	estimate: 'Ends in',
	searchParams: 'Search parameters',
	searchUnavailableDisclaimer: 'Search unavailable for your subscription plan.',
	noProjectsDisclaimer: "There is some reasons you can't see projects.",
	learnMore: 'Learn more',
	showFilters: 'Show filters',
	download: 'Download',
	draft: 'Draft',
	projectPublishedOn: 'Project published %date',
	projectLookingFor: 'Looking for',
	overtimePayment: 'Overtime payment',
	hour: 'hour',
	projectFinished: 'Project finished.',
	edit: 'Edit',
	markAsFinished: 'Mark as finished',
	delete: 'Delete',
	empty: 'Empty',
	featured: 'Featured',
	recommendations: 'Recommendations',
	contractorIsBusy: 'Contractor is busy',
	andMore: 'and',
	projectApplicationsDisclaimer:
		'By default there shows only new applications, you can find rest applications by filtering in the right upper corn.',
	application: 'Application',
	deleteProjectQuestion: 'Delete project?',
	planDiscount: 'Subscription plan discounts',
	quickSearch: 'Quick search',
	hint: 'Hint',
	headerSupportHintText:
		'If you will encounter any of the issues, please contact our team either via chat or email support@assist.video',
	closeChat: 'Close chat',
	allWorks: 'All works',
	inviteFriend: 'Refer a friend',
	enterEmail: 'Enter email',
	cookiesDisclaimer:
		'We use cookies to make improvements to our service and make it more comfortable. Using this site, you agree with using of your cookie files.',
	login: 'Login',
	more: 'More',
	inviteToProject: 'Invite to project',
	bookmarks: {
		deleted: 'Bookmark deleted.',
		added: 'Bookmark added.'
	},
	buttons: {
		back: 'Back',
		accept: 'Accept',
		decline: 'Decline',
		cancel: 'Cancel',
		continue: 'Continue',
		choose: 'Choose',
		send: 'Send',
		continueSearch: 'Continue search',
		open: 'Open',
		edit: 'Edit',
		delete: 'Delete',
		invite: 'Invite',
		enter: 'Enter',
		createAccount: 'Create account',
		message: 'Message',
		recommend: 'Recommend',
		apply: 'Apply',
		signup: 'Signup',
		changePlan: 'Change plan'
	},
	errors: {
		base: 'Error occured. Contact support.',
		QUOTA_EXCEEDED: 'Subscription quota exceeded. Upgrade subscription.',
		ALREADY_BOOSTED: 'Project already raised.',
		PROJECT_NOT_FOUND: 'Project not found.',
		ALREADY_APPLIED: 'You have already applied to this project.',
		EMPTY_PORTFOLIO: 'Add project to portfolio.',
		invalidVerification: 'Verification link is invalid. Please try again.',
		upgradeToPremium: 'Улучшите подписку до уровня «Premium».',
		invalidEmail: 'Invalid email',
		invalidLogin: 'Invalid login',
		invalidPassword: 'Invalid password',
		socialAuthError: 'Cannot access email, grant access to application to use Email from Facebook/Google.',
		UNAUTHENTICATED: 'Invalid login or password.',
		RATE_LIMIT: 'Request rate limit. Try again later.',
		passwordValidation:
			'Password length from 8 symbols and can contain only latin, digits and symbols ! @ # $ % ^ & * _',
		invalidFirstname: 'Enter first name',
		invalidLastname: 'Enter last name',
		invalidAgreement: 'Confirm agreement',
		invalidPassword2: 'Passwords did not match',
		NO_PASSWORD: 'Enter password.',
		EMAIL_ALREADY_USED: 'Email alread used.',
		alreadyRecommended: 'You alrady recommended this user',
		passwordChange: 'Error occured or expired link. Try restore again.',
		noProjectsForInvite: "You haven't projects for invite.",
		selectProjectForInvite: 'Select project for invite.',
		selectedContractorIsBusy: 'Contractor cannot be invited (busy).',
		invalidLinkOrFile: 'Add link or upload file',
		invalidTitle: 'Enter title',
		invalidDescription: 'Enter description',
		invalidSpecialties: 'Choose specialties'
	},
	project: {
		applications: {
			countOptions: {
				unread: 'Unread',
				test: 'Test sent',
				seen: 'Seen',
				accepted: 'Accepted',
				invites: 'Invites'
			},
			application: {
				whyMe: 'Why me',
				myExpectations: 'Expectations',
				testSent: 'Test sent.',
				sendTest: 'Send test',
				message: 'Message'
			},
			archiveDialog: {
				title: 'Are you sure you want to finish project?',
				description: 'Project will not be available for search'
			},
			deleteDialog: {
				title: 'Are you sure you want to delete project?',
				description: 'Project will not be saved in archive'
			},
			publishDialog: {
				title: 'Are you sure you want to publish project?',
				description: 'Project will not be saved in archive'
			},
			rejectDialog: {
				title: 'Are you sure you want to decline application?',
				description: 'Application will be hidden'
			},
			approveDialog: {
				title: 'Choose as contractor for project?'
			},
			congratulationDialog: {
				title: 'Congratulations! You found contractor',
				listTitle: 'Next steps:',
				listItems: [
					'Send job description and details to contractor through the chat',
					'Make an agreement about payments',
					'Exchange contacts if there is no in profile',
					'For your convenience make communication through the chat'
				],
				subtitle:
					'Do not forget to leave feedback about contractor and close project! If you have any questions you can write message in chat or email support@assist.video. Good luck with project! Your Assist.'
			}
		}
	},
	sidebar: {
		specialties: {
			all: 'All specialties',
			maximum: 'Maximum quantity of specialties - %d',
			notFound: 'Not found specialties.'
		}
	},
	dialogs: {
		projectPreview: {
			previewOnLink: ['Preview', 'link'],
			with: 'Along with'
		},
		choosenAsContractor: {
			title: 'Congratulations! You have been chosen as contractor.',
			listTitle: 'Your next steps:',
			listItems: [
				'Contact with employer for details',
				'Make agreement about payment',
				'Exchange with contacts, if there is no in profile',
				'Send conversation results to chat'
			],
			subtitle: [
				'If you have any questions, please message or email support@assist.video.',
				'Good luck with project!',
				'Your Assist.'
			]
		}
	},
	pages: {
		employer: {
			contractor: {
				invite: {
					title: 'Your active projects',
					addProject: 'Add project',
					success: 'Succeess',
					successDisclaimer: 'You have invited %s to participate in your project.'
				}
			}
		},
		contractor: {
			applications: {
				list: {
					title: 'My applications',
					filters: {
						active: 'Active',
						accepted: 'Archived'
					},
					archiveFilters: {
						accepted: 'Accepted',
						rejected: 'Rejected'
					},
					card: {
						until: 'Ends in',
						ended: 'Closed',
						count: 'Applications sent'
					}
				}
			},
			portfolio: {
				edit: {
					step: 'Step',
					linkDisclaimer: 'YouTube, RuTube, Vimeo, Vk.com, Kinopoisk or Soundcloud',
					validation: {
						title: 'Enter title',
						link: 'Not supported link',
						description: 'Add description',
						linkOrFile: 'Add link or upload file',
						projectType: 'Select project type',
						specialty: 'Select specialty',
						userOrName: 'Enter user ID or first and last name'
					}
				}
			},
			project: {
				view: {
					congratulations: {
						title: 'You can contact with employer with our chat',
						subtitle: [
							'If employer will accept your application you will see contacts.',
							'If you want to access contacts anyway — you can upgrade your subscription plan to Premium.'
						]
					}
				},
				suitable: {
					title: 'Suitable projects',
					notFound: 'Not found suitable projects.'
				},
				apply: {
					whyMe: 'Why choose me?',
					hasTest: 'Project contains test',
					hasTestDisclaimer: 'Employee will send test if your application will be suitable',
					lastWorks: 'Your last works',
					lastWorksDisclaimer: 'Add your last three works. Link your portfolio or YouTube or Vimeo.',
					link: 'Work link',
					fillPortfolio: 'To apply you need some projects to portfolio',
					success: 'Application successfully sent',
					declined: 'Application rejected',
					exceededDisclaimer:
						'You do not have subscription or exceeded quota. To apply you need to buy or upgrade subscription.'
				}
			}
		},
		auth: {
			signin: {
				title: 'Signin',
				authWith: 'Auth with',
				or: 'or',
				forgotPassword: 'Forgot password?',
				disclaimer: ["I'm agree with", 'Privacy policy', 'and', 'Terms of use']
			},
			signup: {
				title: 'Signup'
			},
			forgot: {
				title: 'Forgot your password',
				disclaimer: 'Enter your email.'
			},
			restorePassword: {
				title: 'Restore password'
			}
		},
		settings: {
			menu: {
				common: 'General information',
				specialties: 'Your services',
				contacts: 'Contact information',
				password: 'Password',
				subscription: 'Subscription',
				portfolio: 'Portfolio'
			}
		}
	}
};
