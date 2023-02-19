import {UserModel} from '@/server/schema/entities/UserTC';
import {userCreate} from './userCreate';
import normalizeEmail from 'normalize-email';

interface Credentials {
	facebookId?: string;
	googleId?: string;
}

interface UserData {
	email: string;
	firstName?: string;
	lastName?: string;
}

export async function userFindByAuthOrCreate(credentials: Credentials, userData: UserData) {
	const query: any = {$or: [credentials]};
	let isCreated = false;
	if (userData.email) {
		const email = normalizeEmail(userData.email);
		query.$or.push({email});
	}
	let user = await UserModel.findOne(query);
	if (!user) {
		user = await userCreate(
			{
				...credentials,
				...userData
			},
			{sendMail: true}
		);
		isCreated = true;
	}
	return user ? {...user.toObject(), isCreated} : undefined;
}
