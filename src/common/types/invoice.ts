interface Invoice {
	id: string;
	type: 'subscription' | 'subscription_upgrade';
	data: any;
}

export {Invoice};
