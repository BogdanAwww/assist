interface Specialty {
	_id: string;
	title: string;
	titles?: Record<string, string>;
	isFrequentlyUsed?: boolean;
}

interface SpecialtyGroup {
	_id: string;
	title: string;
	titles?: Record<string, string>;
	specialties?: Specialty[];
}

export {Specialty, SpecialtyGroup};
