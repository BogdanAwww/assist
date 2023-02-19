import got from 'got';
import { SystemModel } from '@/server/schema/entities/SystemTC';

const API_KEY = 'c07b2c32f7e4463aa905e3f13a876b14';
const MIN_RATE = 4;
const MAX_RATE = 10;

export default async function() {
    try {
        const response = await got(`https://openexchangerates.org/api/latest.json?app_id=${API_KEY}`, {responseType: 'json'});
        const body = (response.body as any) || {};
        const rates = body?.rates || {};
        const rateRUBKZT = Math.floor(rates.KZT / rates.RUB * 100) / 100;
        if (typeof rateRUBKZT === 'number' && rateRUBKZT > MIN_RATE && rateRUBKZT < MAX_RATE) {
            await SystemModel.updateOne({}, {'rate.rubkzt' : rateRUBKZT}, {upsert: true});
        }
        const rateUSDRUB = rates.RUB;
        if (typeof rateUSDRUB === 'number') {
            await SystemModel.updateOne({}, {'rate.usdrub' : rateUSDRUB}, {upsert: true});
        }
    } catch(e) {
        console.log('check exchange rates error');
        return;
    }
};
