import { Document } from 'mongoose';
import { UserModel } from "@/server/schema/entities/UserTC";
import mailgunMailer from '@/server/modules/mail';
import { getHostUrl } from "@/server/utils/host-utils";
import { upperFirst } from "lodash";
import { filterMailedUsers, getDaysPeriodFromNow } from '../utils';

const PERIOD = 3;

export default async function() {
    const users = await UserModel.find({'_subscription.end': getDaysPeriodFromNow(0, PERIOD)});
    const notNotifiedUsers = await filterMailedUsers(users, 'sub-expiration', {ts: getDaysPeriodFromNow(-PERIOD)});
    if (notNotifiedUsers.length === 0) {
        console.log('no expired subscriptions');
        return;
    }

    notNotifiedUsers.forEach((user: Document) => {
        const subscription = user.get('_subscription');
        const email = user.get('email');
        if (subscription.level !== 'start') {
            console.log(`sent subscription expiration mail to ${email}`);
            mailgunMailer.send('sub-expiration', email, {
                level: upperFirst(subscription.level),
                date: formatDate(subscription.end),
                link: getHostUrl() + '/subscription'
            });
        }
    });
};

function formatDate(ts: number): string {
    const date = new Date(ts);
    const day = ('' + date.getDate()).padStart(2, '0');
    const month = ('' + (date.getMonth() + 1)).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}
