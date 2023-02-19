import xlsx from 'node-xlsx';
import {uniqBy} from 'lodash';
import {userFindMany} from '@/server/vendor/user/userFindMany';
import {UserModel} from '@/server/schema/entities/UserTC';
import {SpecialtyModel} from '@/server/schema/entities/SpecialtyTC';

type XLSXCell = string | undefined;
type XLSXLine = XLSXCell[];
type XLSXSheet = XLSXLine[];

const WEBSITE_REGEXP = /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}?\/?$/;
const URL_REGEXP = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

async function migrateUsersFromXLSX(buffer?: Buffer) {
	if (!buffer) {
		throw new Error('invalid data');
	}
	const workSheetsFromFile = xlsx.parse(buffer);
	const sheet = workSheetsFromFile[0];
	if (!sheet) {
		throw new Error('no sheet');
	}
	const data = sheet.data as XLSXSheet;
	if (!data || !data.length) {
		throw new Error('no data');
	}

	const specialties = await SpecialtyModel.find().lean();

	let matchers: Matchers;
	const users = data.reduce((acc, line, index) => {
		if (index === 0) {
			matchers = getMatchers(line as string[]);
		} else {
			const userdata = parseUserData(matchers, line);
			if (userdata && userdata.email && userdata.id) {
				acc.push(prepareUserData(userdata, specialties));
			}
		}
		return acc;
	}, [] as any[]);
	const preparedUsers = uniqBy(users, 'email');
	// console.log(results);
	const emails = preparedUsers.map((user) => user.email);
	const existing = await userFindMany({filter: {email: {$in: emails}}});
	const existingEmails = existing.map((user) => user.get('email'));
	// console.log('existing', existing);

	const writeData = preparedUsers.reduce((acc, data) => {
		if (!existingEmails.includes(data.email)) {
			return acc.concat([
				{
					updateOne: {
						filter: {email: data.email},
						update: new UserModel(data).toObject(),
						upsert: true
					}
				}
			]);
		}
		return acc;
	}, []);

	if (writeData.length === 0) {
		return {
			total: data.length - 1,
			prepared: preparedUsers.length,
			skipped: existingEmails.length,
			inserted: 0,
			errors: 0
		};
	}

	// await UserModel.remove({email: {$in: existingEmails}});
	return UserModel.bulkWrite(writeData).then((results) => {
		// console.log(results);
		const upsertedCount = results?.upsertedCount;
		const errorsCount = (results?.result?.writeErrors || []).length;
		return {
			total: data.length - 1,
			prepared: preparedUsers.length,
			skipped: existingEmails.length,
			inserted: upsertedCount,
			errors: errorsCount
		};
	});
}

type CheckMatchFn = (header: string) => boolean;
interface MatcherOption {
	name: string;
	check: CheckMatchFn;
}

interface Matcher {
	name: string;
	index: number;
}

type Matchers = Matcher[];

const matchersOptions: MatcherOption[] = [
	{
		name: 'id',
		check: (header) => header.toLowerCase() === 'id'
	},
	{
		name: 'firstName',
		check: (header) => header.toLowerCase().startsWith('имя')
	},
	{
		name: 'lastName',
		check: (header) => header.toLowerCase().startsWith('фамилия')
	},
	{
		name: 'email',
		check: (header) => header.toLowerCase().includes('email')
	},
	{
		name: 'specialties',
		check: (header) => header.toLowerCase().includes('должност') || header.toLowerCase().includes('специальност')
	},
	{
		name: 'phone',
		check: (header) => header.toLowerCase().includes('телефон')
	},
	{
		name: 'vimeo',
		check: (header) => header.toLowerCase().includes('vimeo')
	},
	{
		name: 'youtube',
		check: (header) => header.toLowerCase().includes('youtube')
	},
	{
		name: 'geo',
		check: (header) => header.toLowerCase().includes('гео')
	},
	{
		name: 'portfolio',
		check: (header) => header.toLowerCase().includes('портфолио')
	},
	{
		name: 'telegram',
		check: (header) => header.toLowerCase().includes('телеграм')
	},
	{
		name: 'instagram',
		check: (header) => header.toLowerCase().includes('instagram')
	}
];

function getMatchers(headers: string[]): Matchers {
	return matchersOptions.reduce((acc, matcher) => {
		const match = headers.reduce((acc, header, index) => {
			if (matcher.check(header)) {
				return {
					name: matcher.name,
					index
				};
			}
			return acc;
		}, undefined);
		if (match) {
			acc.push(match);
		}
		return acc;
	}, [] as Matcher[]);
}

function parseUserData(matchers: Matchers, line: XLSXLine): any {
	return matchers.reduce((acc, matcher) => {
		acc[matcher.name] = line[matcher.index];
		return acc;
	}, {});
}

function prepareUserData(userdata: any, dbSpecialties: any[]): any {
	if (!userdata.firstName) {
		userdata.firstName = userdata.lastName;
		userdata.lastName = undefined;
	}
	userdata.email = userdata.email.toLowerCase();
	const links = (
		[userdata.vimeo, userdata.youtube, userdata.portfolio, userdata.telegram, userdata.instagram] as string[]
	)
		.filter(Boolean)
		.reduce((acc, item) => [...acc, ...item.split(' ')], []);
	const website = links.find((link) => WEBSITE_REGEXP.test(link));
	const contacts = links.filter((link) => link !== website).filter((value) => URL_REGEXP.test(value));
	const userSpecialties = (userdata.specialties || '')
		.split(',')
		.filter(Boolean)
		.map((item) => item.toLowerCase().trim())
		.filter(Boolean);
	const specialties = dbSpecialties
		.filter((specialty) => userSpecialties.includes((specialty.titles.ru || '').toLowerCase()))
		.map((specialty) => specialty._id);
	return {
		firstName: userdata.firstName,
		lastName: userdata.lastName,
		email: userdata.email,
		phone: userdata.phone,
		website,
		contacts,
		specialties,
		_info: {
			migrateId: userdata.id
		}
	};
}

export {migrateUsersFromXLSX};
