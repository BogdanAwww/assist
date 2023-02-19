import {schemaComposer} from 'graphql-compose';
import {NumberType} from '../Scalars';

const ProjectReferenceInput = schemaComposer.createInputTC({
	name: 'ProjectReferenceInput',
	fields: {
		description: 'String!',
		example: 'String',
		upload: 'String'
	}
});

const ProjectTestInput = schemaComposer.createInputTC({
	name: 'ProjectTestInput',
	fields: {
		description: 'String',
		file: 'String'
	}
});

const CreateProjectPaycheckInput = schemaComposer.createInputTC({
	name: 'CreateProjectPaycheckInput',
	fields: {
		type: 'String',
		amount: 'Int',
		overtime: 'Int',
		comment: 'String'
	}
});

export const CreateProjectInput = schemaComposer.createInputTC({
	name: 'CreateProjectInput',
	fields: {
		type: 'String',
		title: 'String',
		description: 'String',
		attachment: 'String',
		specialties: '[String]',
		onlyPremium: 'Boolean',
		location: 'String',
		projectDate: NumberType,
		endDate: NumberType,
		period: 'String',
		nonCommercial: 'Boolean',
		budget: 'Int',
		paycheck: CreateProjectPaycheckInput.NonNull,
		references: ProjectReferenceInput.NonNull.List,
		test: ProjectTestInput.NonNull
	}
});

export const SearchProjectInput = schemaComposer.createInputTC({
	name: 'SearchProjectInput',
	fields: {
		type: 'String',
		period: 'String',
		hideTest: 'Boolean',
		paycheckType: 'String',
		paycheckAmount: NumberType,
		budgetFrom: NumberType,
		nonCommercial: 'Boolean',
		onlyPremium: 'Boolean'
	}
});

export const ProjectApplyInput = schemaComposer.createInputTC({
	name: 'ProjectApplyInput',
	fields: {
		project: 'String!',
		description: 'String',
		links: '[String]',
		budget: NumberType,
		shiftCost: NumberType
	}
});

export const MyApplicationsFilterInput = schemaComposer.createInputTC({
	name: 'MyApplicationsFilterInput',
	fields: {
		status: 'String'
	}
});

export const ProjectApplicationsFilterInput = schemaComposer.createInputTC({
	name: 'ProjectApplicationsFilterInput',
	fields: {
		project: 'String!',
		isUnread: 'Boolean',
		showTest: 'Boolean',
		status: 'String'
	}
});
