import {Specialty, SpecialtyGroup} from '@/common/types/specialty';
import {SelectOptionsType} from '@/common/views/select/select';

function getSpecialtyTitle(groups: SpecialtyGroup[], id: string, lang: string = 'ru'): string {
	return groups.reduce((acc, {specialties}) => {
		if (specialties) {
			return (
				acc ||
				specialties.reduce(
					(acc, specialty) => acc || (specialty._id === id ? specialty.titles![lang] || specialty.title : ''),
					''
				)
			);
		}
		return acc;
	}, '');
}

function getSpecialty(groups: SpecialtyGroup[], _id: string): Specialty {
	return {
		_id,
		title: getSpecialtyTitle(groups, _id)
	};
}

function getSpecialtyFrequenties(groups: SpecialtyGroup[]): Specialty[] {
	return groups.reduce((acc, group) => {
		const specialties = group.specialties?.filter((specialty) => specialty.isFrequentlyUsed);
		// .map((specialty) => ({title: specialty.title, value: specialty._id}));
		if (specialties && specialties.length > 0) {
			return [...acc, ...specialties];
		}
		return acc;
	}, []);
}

function getSpecialtySelectOptions(groups: SpecialtyGroup[]): SelectOptionsType {
	return groups.reduce((acc, group) => {
		const specialties = group.specialties?.map((specialty) => ({label: specialty.title, value: specialty._id}));
		if (specialties && specialties.length > 0) {
			return [...acc, ...specialties];
		}
		return acc;
	}, []);
}

export {getSpecialtyTitle, getSpecialty, getSpecialtyFrequenties, getSpecialtySelectOptions};
