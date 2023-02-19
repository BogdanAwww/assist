import fs from 'fs';
import path from 'path';
import { dbPromise } from '@/server/modules/db';
import { CountryModel } from '@/server/schema/entities/CountryTC';

const filepath = path.join(__dirname, 'countries.json');
const countriesData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
const bulkOps = countriesData.map((country) => {
    return {
        updateOne: {
            filter: { code: country.code },
            update: country,
            upsert: true
        }
    };
});

dbPromise
    .then(() => CountryModel.bulkWrite(bulkOps))
    .then((bulkWriteOpResult) => {
        console.log('BULK update OK');
        console.log(JSON.stringify(bulkWriteOpResult, null, 4));
    })
    .catch((err) => {
        console.log('BULK update error');
        console.log(JSON.stringify(err, null, 4));
    });