import _ from 'lodash';
import { dbPromise } from '@/server/modules/db';
import { SpecialtyModel } from '@/server/schema/entities/SpecialtyTC';

const SPECIALTIES = [
    'Режиссер-постановщик',
    'Звукорежиссер',
    'Сценарист',
    'Сопродюсер',
    'Второй режиссер',
    'Помощник режиссера',
    'Каскадёр',
    'Костюмер',
    'Осветитель'
];

async function updateFrequently() {
    await SpecialtyModel.updateMany({isFrequentlyUsed: true}, {$unset: {isFrequentlyUsed: 1}});
    await SpecialtyModel.updateMany({'titles.ru': {$in: SPECIALTIES}}, {$set: {isFrequentlyUsed: true}});
}

dbPromise
    .then(updateFrequently)
    .then(() => {
        console.log('BULK update OK');
    })
    .catch((err) => {
        console.log('BULK update error');
        console.log(JSON.stringify(err, null, 4));
    });
