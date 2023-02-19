import fs from 'fs';
import path from 'path';
import { dbPromise } from '@/server/modules/db';
import { CityModel } from '@/server/schema/entities/CityTC';
import { CountryModel } from '@/server/schema/entities/CountryTC';

const filepath = path.join(__dirname, 'cities.json');
const countriesData = JSON.parse(fs.readFileSync(filepath, 'utf8'));

function prepareData(countries): any[] {
    const countriesMap = {};
    countries.forEach((country) => {
        countriesMap[country.code] = country;
    });
    return countriesData.map((city) => {
        const country = countriesMap[city.country_code];
        return {
            updateOne: {
                filter: { geonameid: city.geonameid },
                update: {
                    ...city,
                    country,
                    fullNames: {
                        ...city.fullNames,
                        en: `${country.name}, ${city.name}`
                    }
                },
                upsert: true
            }
        };
    });
}

dbPromise
    .then(() => CountryModel.find())
    .then(prepareData)
    .then((bulkOps) => CityModel.bulkWrite(bulkOps))
    .then((bulkWriteOpResult) => {
        console.log('BULK update OK');
        console.log(JSON.stringify(bulkWriteOpResult, null, 4));
    })
    .catch((err) => {
        console.log('BULK update error');
        console.log(JSON.stringify(err, null, 4));
    });
