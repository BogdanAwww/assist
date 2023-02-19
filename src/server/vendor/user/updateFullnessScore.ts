import {Document} from 'mongoose';

const CONTRACTOR_REQUIRED_FIELDS = ['firstName', 'lastName', 'country', 'city', 'specialties', 'email'];
const EMPLOYER_REQUIRED_FIELDS = ['firstName', 'lastName', 'country', 'city', 'email'];

function getFieldsScore(user: Document, fields: string[]): number {
	const data = user.toObject({virtuals: true});
	const total = fields.length;
	const weight = fields.reduce((acc, fieldName) => {
		const value = data[fieldName];
		if (value) {
			if (value instanceof Array) {
				acc += value.length > 0 ? 1 : 0;
			} else {
				acc++;
			}
		}
		return acc;
	}, 0);
	const score = Math.floor((weight / total) * 100) / 100;
	return score;
}

export function getFullnessScore(user: Document) {
	return {
		contractor: getFieldsScore(user, CONTRACTOR_REQUIRED_FIELDS),
		employer: getFieldsScore(user, EMPLOYER_REQUIRED_FIELDS)
	};
}

export function updateFullnessScore(user: Document): void {
	user.set('_info.fullness', getFullnessScore(user));
}
