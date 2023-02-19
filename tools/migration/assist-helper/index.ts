import { CountryModel } from '@/server/schema/entities/CountryTC';
import { dbPromise } from '@/server/modules/db';
import { UserModel } from '@/server/schema/entities/UserTC';
import { CityModel } from '@/server/schema/entities/CityTC';
import Auth from '@/server/modules/auth';
import { ASSIST_HELPER_EMAIL, ASSIST_HELPER_PASSWORD } from '@/server/modules/assist-helper';

(async () => {
    const hashPassowrd = await Auth.hashPassword(ASSIST_HELPER_PASSWORD)
    const city = await CityModel.findOne({ name: "Moscow"});
    const country = await CountryModel.findOne({ code: "RU"});
    if (!city || !country) {
        throw new Error('Missing country or city');
        return null;
    }
    const assistHelperData = {
        updateOne: {
            filter: { email: ASSIST_HELPER_EMAIL},
            update: {
                username: 'Assist.Helper',
                firstName: 'Assist',
                lastName: 'Helper',
                email: ASSIST_HELPER_EMAIL,
                password: hashPassowrd,
                description: '',
                country: country._id,
                city: city._id,
                specialties: [],
                contacts: [],
                verified: true
            },
            upsert: true

        }
    }

    const bulkOps = [assistHelperData]

    dbPromise
        .then(() => UserModel.bulkWrite(bulkOps))
        .then((bulkWriteOpResult) => {
          console.log('BULK update OK');
            console.log(JSON.stringify(bulkWriteOpResult, null, 4));
     })
     .catch((err) => {
        console.log('BULK update error');
        console.log(err);
     });

})()
