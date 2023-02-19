import * as Yup from 'yup';
import {Viewer, UpdateUserSettings} from '@/common/types/user';
import {RoleType} from '../state/app-state';

const PHONE_REGEXP = /^\+(\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const WEBSITE_REGEXP =
	/((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/;
const URL_REGEXP = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

const USER_VALIDATION = {
	COMMON: Yup.object().shape({
		firstName: Yup.string().required('Введите имя'),
		lastName: Yup.string().required('Введите фамилию'),
		country: Yup.string().required('Выберите страну'),
		city: Yup.string().required('Выберите город')
	}),
	SPECIALTY: Yup.object().shape({
		specialties: Yup.array().test('min', 'Выберите хотя бы одну специальность', function (value) {
			return (value || []).length > 0;
		})
	}),
	CONTACTS: Yup.object().shape({
		email: Yup.string().email('Неверный email').required('Введите email'),
		phone: Yup.string().test('phone', 'Формат номера +xxxxxxxxxx', function (value) {
			const replaced = value?.replace(/[\s\(\)]/g, '') || '';
			const match = replaced.match(PHONE_REGEXP);
			return Boolean(match?.[0]);
		}),
		website: Yup.string().test('website', 'Неверный адрес сайта', function (value) {
			const realValue = (value || '').trim();
			return realValue ? Boolean(realValue.match(WEBSITE_REGEXP)) : true;
		}),
		contacts: Yup.array().of(
			Yup.string().test('url', 'Неверная ссылка', function (value) {
				const realValue = (value || '').trim();
				return realValue ? Boolean(realValue.match(URL_REGEXP)) : true;
			})
		)
	})
};

const USER_VALIDATION_SCHEMA = Yup.object().shape({
	...USER_VALIDATION.COMMON.required().fields,
	...USER_VALIDATION.SPECIALTY.required().fields,
	...USER_VALIDATION.CONTACTS.required().fields
});

const EMPLOYER_VALIDATION = {
	COMMON: USER_VALIDATION.COMMON.required(),
	SPECIALTY: USER_VALIDATION.SPECIALTY.clone().omit(['specialties']).required(),
	CONTACTS: USER_VALIDATION.CONTACTS.required()
};

const CONTRACTOR_VALIDATION = {
	COMMON: USER_VALIDATION.COMMON.required(),
	SPECIALTY: USER_VALIDATION.SPECIALTY.required(),
	CONTACTS: USER_VALIDATION.CONTACTS.required()
};

const PASSWORD_VALIDATION_SCHEMA = Yup.object().shape({
	password: Yup.string().min(8, 'Минимум 8 символов').required('Введите старый пароль'),
	newPassword: Yup.string()
		.test(
			'right',
			'Пароль может содержать только латинские буквы, цифры и знаки ! @ # $ % ^ & * _',
			function (value) {
				return /^[a-zA-Z0-9!@#$%^&*_]+$/g.test(value || '');
			}
		)
		.min(8, 'Минимум 8 символов')
		.required('Введите новый пароль'),
	newPassword2: Yup.string().oneOf([Yup.ref('newPassword')], 'Пароли не совпадают')
});

type CommonSettings = Pick<
	UpdateUserSettings,
	'avatar' | 'firstName' | 'lastName' | 'description' | 'country' | 'city' | 'busy'
>;

function getCommonSettings(viewer: Viewer): CommonSettings {
	return {
		avatar: viewer.avatar?._id || undefined,
		firstName: viewer.firstName || '',
		lastName: viewer.lastName || '',
		description: viewer.description || '',
		country: viewer.country?._id,
		city: viewer.city?._id,
		busy: Boolean(viewer.busy)
	};
}

type SpecialtySettings = Pick<UpdateUserSettings, 'specialties'>;

function getSpecialtySettings(viewer: Viewer): SpecialtySettings {
	return {
		specialties: viewer.specialties?.map((specialty) => specialty?._id) || []
	};
}

type ContactsSettings = Pick<
	UpdateUserSettings,
	'email' | 'phone' | 'website' | 'contacts' | 'hideContacts' | 'hidePhone'
>;

function getContactsSettings(viewer: Viewer): ContactsSettings {
	return {
		email: viewer.email,
		phone: viewer.phone || '',
		website: viewer.website || '',
		contacts: (viewer.contacts || []).filter(Boolean).concat(['', '', '']).slice(0, 3),
		hidePhone: Boolean(viewer.hidePhone),
		hideContacts: Boolean(viewer.hideContacts)
	};
}

function viewerToUserSettings(viewer: Viewer): UpdateUserSettings {
	return {
		...getCommonSettings(viewer),
		...getSpecialtySettings(viewer),
		...getContactsSettings(viewer)
	};
}

type ValidationType = keyof typeof USER_VALIDATION;

function getSchemaByRole(type: ValidationType, role?: RoleType): Yup.AnyObjectSchema {
	const schema = role === 'employer' ? EMPLOYER_VALIDATION : CONTRACTOR_VALIDATION;
	return schema[type];
}

function validateViewerWithSchema(viewer: Viewer | undefined, schema: Yup.AnyObjectSchema): boolean {
	try {
		if (viewer?.demo) {
			return true;
		}
		if (viewer) {
			schema.validateSync(viewerToUserSettings(viewer));
		}
		return Boolean(viewer);
	} catch (e) {
		return false;
	}
}

function isValidViewer(viewer: Viewer | undefined): boolean {
	return validateViewerWithSchema(viewer, USER_VALIDATION_SCHEMA);
}

function isSearchAvailable(_viewer: Viewer | undefined): boolean {
	// const level = viewer?.subscription?.level;
	return true; // Boolean(level && level !== 'start'); // > start
}

function getFullnessScore(viewer: Viewer, role?: RoleType): number {
	return (viewer.fullnessScore || {})[role || 'contractor'] || 0;
}

export {
	USER_VALIDATION,
	WEBSITE_REGEXP,
	URL_REGEXP,
	PASSWORD_VALIDATION_SCHEMA,
	CommonSettings,
	SpecialtySettings,
	ContactsSettings,
	getCommonSettings,
	getSpecialtySettings,
	getContactsSettings,
	viewerToUserSettings,
	getSchemaByRole,
	validateViewerWithSchema,
	isValidViewer,
	isSearchAvailable,
	getFullnessScore
};
