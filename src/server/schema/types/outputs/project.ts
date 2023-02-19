import {schemaComposer} from 'graphql-compose';
import {ProjectTC} from '../../entities/ProjectTC';

export const MyProjectsCountOutput = schemaComposer.createObjectTC({
	name: 'MyProjectsCountOutput',
	fields: {
		active: 'Int',
		draft: 'Int',
		archived: 'Int'
	}
});

export const SearchProjectCountOutput = schemaComposer.createObjectTC({
	name: 'SearchProjectCountOutput',
	fields: {
		total: 'Int',
		before: 'Int',
		inDay: 'Int',
		after: 'Int',
		whole: 'Int'
	}
});

export const SearchProjectOutput = schemaComposer.createObjectTC({
	name: 'SearchProjectOutput',
	fields: {
		items: [ProjectTC],
		count: SearchProjectCountOutput
	}
});

export const MyApplicationsCountOutput = schemaComposer.createObjectTC({
	name: 'MyApplicationsCountOutput',
	fields: {
		active: 'Int',
		accepted: 'Int',
		rejected: 'Int'
	}
});

export const PortfolioLinkDataOutput = schemaComposer.createObjectTC({
	name: 'PortfolioLinkDataOutput',
	fields: {
		thumbnail: 'String',
		iframe: 'String'
	}
});
