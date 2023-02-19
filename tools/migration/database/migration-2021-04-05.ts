// import { sendVerification } from "@/server/vendor/user/sendVerification";

// import { UserModel } from '@/server/schema/entities/UserTC';
// import { PortfolioProjectModel } from '@/server/schema/entities/PortfolioProjectTC';

// import mailgunMailer from "@/server/modules/mail";
// import { AuthTokenModel } from "@/server/schema/entities/AuthTokenTC";
// import { UserModel } from "@/server/schema/entities/UserTC";
// import { getFullnessScore } from '@/server/vendor/user/updateFullnessScore';
// import { PortfolioProjectModel } from '@/server/schema/entities/PortfolioProjectTC';
// import { ProjectModel } from '@/server/schema/entities/ProjectTC';
// import { getHostUrl } from "@/server/utils/host-utils";
// import fs from 'fs';
// import { CityModel } from '@/server/schema/entities/CityTC';
// import { uniq, get } from 'lodash';
// import { SpecialtyModel } from '@/server/schema/entities/SpecialtyTC';

export const version = 5;

export default async function() {
    // const users = await UserModel.find({verified: false, createdAt: {$gt: 1617625049}});
    // console.log(users.length);
    // const bigPromise = users.reduce((promise, user) => {
    //     return promise
    //         .then(() => sendVerification(user))
    //         .then(() => {
    //             console.log('sended to', user.get('email'));
    //         })
    //         .catch(() => {});
    // }, Promise.resolve());
    // await bigPromise;

    // signin mail

    // const tokens = await AuthTokenModel.find({ip: {$in: uniqIps}});

    // const userIds = uniq(tokens.map((token) => token.get('user'))).filter(Boolean);

    // const users = await UserModel.find({_id: {$in: userIds}});

    // const bigPromise = users.reduce((promise, user) => {
    //     return promise
    //         .then(() => {
    //             return mailgunMailer.send('signin-problems', user.get('email'), {
    //                 link: getHostUrl() + '/signin'
    //             });
    //         })
    //         .then(() => {
    //             console.log('sended to', user.get('email'));
    //         })
    //         .catch(() => {});
    // }, Promise.resolve());

    // await bigPromise;

    // update subscription start to basic
    // const users = await UserModel.find({'_subscription.level': 'start'});
    // const updates = users.map((user) => {
    //     const filter = {_id: user._id};
    //     return {
    //         updateOne: {
    //             filter,
    //             update: {'_subscription.level': 'basic', '_subscription.quota': {projects: 20, applications: 20, boosts: 3}}
    //         }
    //     };
    // });
    // return UserModel.bulkWrite(updates);

    // update hasPortfolio
    // const users = await UserModel.find({});
    // const portfolios = await PortfolioProjectModel.find({}).lean();
    // const updates = users.map((user) => {
    //     const filter = {_id: user._id};
    //     const userId = user._id.toString();
    //     const count = portfolios.filter((project: any) => project.author.toString() === userId).length;
    //     return {
    //         updateOne: {
    //             filter,
    //             update: {
    //                 '_info.hasPortfolio': count > 0,
    //                 '_info.counter.portfolio': count
    //             }
    //         }
    //     };
    // });
    // return UserModel.bulkWrite(updates);

    // update fullnessScore
    // const users = await UserModel.find({});
    // const updates = users.reduce((changes, user) => {
    //     if (!user.get('_info.fullness')) {
    //         const score = getFullnessScore(user);
    //         changes.push({
    //             updateOne: {
    //                 filter: {_id: user._id},
    //                 update: {
    //                     '_info.fullness': score
    //                 }
    //             }
    //         });
    //     }
    //     return changes;
    // }, [] as any[]);
    // return UserModel.bulkWrite(updates);

    // firstName
    // lastName
    // email
    // phone
    // website
    // contacts
    // description
    // city {
    //     localeFullName
    // }
    // specialties {
    //     title
    // }
    // _info

    // const users = await UserModel.find({});
    // const cities = await CityModel.find({}).lean();
    // const citiesMap = new Map();
    // cities.forEach((city: any) => {
    //     citiesMap.set(city._id.toString(), city.fullNames.ru);
    // });
    // const projects = await ProjectModel.find({status: 'active'}).lean();
    // const projectOwners = uniq(projects.map((project: any) => project.author.toString()));
    // const specialties = await SpecialtyModel.find({}).lean();
    // const specialtiesMap = new Map();
    // specialties.forEach((specialty: any) => {
    //     specialtiesMap.set(specialty._id.toString(), specialty.titles.ru);
    // });
    // const data = users.map((userData) => {
    //     const user = userData.toObject({virtuals: true});
    //     const object = {
    //         firstName: user.firstName || '',
    //         lastName: user.lastName || '',
    //         email: user.email || '',
    //         phone: user.phone || '',
    //         website: user.website || '',
    //         description: (user.description || '').replace(/\n/g, ' '),
    //         contacts: (user.contacts || []).join(),
    //         specialties: (user.specialties || []).map((id) => specialtiesMap.get(id.toString())).join(),
    //         city: citiesMap.get((user.city || '').toString()) || '',
    //         hasPortfolio: get(user, '_info.hasPortfolio') ? '+' : '',
    //         hasProjects: projectOwners.includes(user._id.toString()) ? '+' : ''
    //     };
    //     const result: string[] = [];
    //     for (const key in object) {
    //         result.push(object[key]);
    //     }
    //     return result.join(';');
    // });

    // data.unshift(['firstName', 'lastName', 'email', 'phone', 'website', 'description', 'contacts', 'specialties', 'city', 'hasPortfolio', 'hasProjects'].join(';'));

    // fs.writeFileSync('./userdata.csv', data.join('\n'), {encoding: 'utf-8'});

    // const users = await UserModel.find({});

    // fs.writeFileSync('./emails.txt', users.map((user) => user.get('email')).filter(Boolean).join('\n'), {encoding: 'utf-8'});

    return true;
}
