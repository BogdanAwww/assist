import {preparePaginationResolver} from 'graphql-compose-pagination';
import {Context} from '@/server/modules/context';
import {schemaComposer} from 'graphql-compose';
import {InvoiceTC} from '@/server/schema/entities/InvoiceTC';
import {invoiceFindMany} from '@/server/vendor/invoice/invoiceFindMany';

const filter = {status: 'paid', 'data.priceKZT': {$exists: true}};

const findManyResolver = schemaComposer.createResolver({
	name: 'invoicesMany',
	args: {
		skip: 'Int',
		limit: 'Int'
	},
	async resolve({args: {skip, limit}, context}: {args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			return invoiceFindMany({
				filter,
				skip,
				limit
			});
		}
		return;
	}
});

const countResolver = schemaComposer.createResolver({
	name: 'invoicesCount',
	args: {},
	async resolve({context}: {context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			return invoiceFindMany({
				filter,
				count: true
			});
		}
		return;
	}
});

export default preparePaginationResolver(InvoiceTC, {
	findManyResolver,
	countResolver,
	name: 'paginationAdmin',
	perPage: 20
});
