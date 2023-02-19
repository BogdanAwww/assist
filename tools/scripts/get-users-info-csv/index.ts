import fs from 'fs';
import { uniq, get } from 'lodash';
import { UserModel } from "@/server/schema/entities/UserTC";
import { CityModel } from '@/server/schema/entities/CityTC';
import { ProjectModel } from '@/server/schema/entities/ProjectTC';
import { SpecialtyModel } from '@/server/schema/entities/SpecialtyTC';
import { dbPromise } from '@/server/modules/db';

async function main() {
    const users = await UserModel.find({});
    const cities = await CityModel.find({}).lean();
    const citiesMap = new Map();
    cities.forEach((city: any) => {
        citiesMap.set(city._id.toString(), city.fullNames.ru);
    });
    const projects = await ProjectModel.find({status: 'active'}).lean();
    const projectOwners = uniq(projects.map((project: any) => project.author.toString()));
    const specialties = await SpecialtyModel.find({}).lean();
    const specialtiesMap = new Map();
    specialties.forEach((specialty: any) => {
        specialtiesMap.set(specialty._id.toString(), specialty.titles.ru);
    });
    const data = users.map((userData) => {
        const user = userData.toObject({virtuals: true});
        const utms = get(user, '_info.utms') || {};
        const object = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            website: user.website || '',
            description: (user.description || '').replace(/\n/g, ' '),
            contacts: (user.contacts || []).join(),
            specialties: (user.specialties || []).map((id) => specialtiesMap.get(id.toString())).join(),
            city: citiesMap.get((user.city || '').toString()) || '',
            hasPortfolio: get(user, '_info.hasPortfolio') ? '+' : '',
            hasProjects: projectOwners.includes(user._id.toString()) ? '+' : '',
            utms: Object.entries(utms).map(([key, value]) => `${key}: ${value}`).join('    ')
        };
        const result: string[] = [];
        for (const key in object) {
            result.push(object[key]);
        }
        return result.join(';');
    });

    data.unshift(['firstName', 'lastName', 'email', 'phone', 'website', 'description', 'contacts', 'specialties', 'city', 'hasPortfolio', 'hasProjects', 'utms'].join(';'));

    fs.writeFileSync('./userdata.csv', data.join('\n'), {encoding: 'utf-8'});
}

dbPromise
    .then(main)
    .catch((e) => {
        console.log(e);
    })
    .finally(process.exit);
