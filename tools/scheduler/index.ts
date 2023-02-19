import {environment} from '@/server/config';
import * as Sentry from '@sentry/node';
import '@/server/modules/db';
import schedule, {JobCallback} from 'node-schedule';
import './queue';
import {AssertionError}  from 'assert';

import checkSubscriptionExpiration from './jobs/check-subscription-exp';
import checkExchangeRates from './jobs/check-exchange-rates';
import checkVerification from './jobs/check-verification';
import checkProjectFinished from './jobs/check-project-finished';
import checkUnreadMessages from './jobs/check-unread-messages';

Sentry.init({
	environment,
	dsn: 'https://616712e3547a42daa7790bbe25553de8@o508731.ingest.sentry.io/5601678'
});

interface ScriptDef {
    name: string;
    rule: string;
    fn: Function;
}

const SCRIPTS: ScriptDef[] = [
    {
        name: 'check subscription expiration',
        rule: '0 12 * * *',
        fn: checkSubscriptionExpiration
    },
    {
        name: 'check exchange rates',
        rule: '0 */12 * * *',
        fn: checkExchangeRates
    },
    {
        name: 'check account verification',
        rule: '30 */4 * * *',
        fn: checkVerification
    },
    {
        name: 'check project finished',
        rule: '0 14 * * *',
        fn: checkProjectFinished
    },
    {
        name: 'check unread messages',
        rule: '*/5 * * * *',
        fn: checkUnreadMessages
    }
];

if (environment === 'staging' || environment === 'production') {
    SCRIPTS.forEach((def) => {
        schedule.scheduleJob(def.rule, wrapJob(def.name, def.fn));
    });
} else {
    const scriptNum = process.env.SCRIPT || '';
    const script = SCRIPTS[scriptNum];
    if (!script) {
        console.log("script doesn't exist");
        process.exit();
    } else {
        const job = wrapJob(script.name, script.fn);
        job(new Date());
    }
}

function wrapJob(name: string, fn: Function): JobCallback {
    return (now: Date) => {
        const transaction = Sentry.startTransaction({op: 'script', name});
        console.log(`${now}: start script "${name}"`);
        try {
            fn();
        } catch(e) {
            if (e instanceof AssertionError) {
                console.log(`[${name}] Assertion error`);
            } else {
                console.log(`[${name}] ${e.toString()}`);
            }
            Sentry.captureException(e);
        } finally {
            transaction.finish();
        }
    };
}
