import {User} from '@/common/types/user';

interface Invoice {
	user: User;
	type: string;
	data: any;
	status: string;
	updatedAt: string;
}

export {Invoice};
