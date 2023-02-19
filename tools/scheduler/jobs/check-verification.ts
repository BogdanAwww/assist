import { UserModel } from "@/server/schema/entities/UserTC";
import { sendVerification } from '@/server/vendor/user/sendVerification';
import { filterMailedUsers, getDaysPeriodFromNow } from '../utils';

const PERIOD = 14;

export default async function() {
    const users = await UserModel.find({verified: false, createdAt: getDaysPeriodFromNow(-PERIOD, -1)});
    const notNotifiedUsers = await filterMailedUsers(users, 'remember-verify');
    if (notNotifiedUsers.length === 0) {
        console.log('no users to remember verify');
        return;
    }

    notNotifiedUsers.forEach((user: any) => {
        console.log(`sent remember verification mail to ${user.email}`);
        sendVerification(user, {remember: true});
    });
};
