import assert from 'assert';
import { ProjectModel } from '@/server/schema/entities/ProjectTC';
import { UserModel } from "@/server/schema/entities/UserTC";
// import mailgunMailer from '@/server/modules/mail';
// import { getHostUrl } from "@/server/utils/host-utils";
import { getDaysPeriodFromNow, getMailLogs } from '../utils';

const PERIOD = 7;
const MAIL_PERIOD = 60;

export default async function() {
    return;
    const projects = await ProjectModel.find({createdAt: getDaysPeriodFromNow(PERIOD, PERIOD + 1)});
    assert.notEqual(projects.length, 0);

    const authorIds = projects.map((project) => project.get('author'));
    const users = await UserModel.find({_id: {$in: authorIds}});
    assert.notEqual(users.length, 0);

    const emails = users.map((user) => user.get('email')).filter(Boolean);
    assert.notEqual(users.length, 0);

    const mailLogs = await getMailLogs('sub-expiration', {email: {$in: emails}, ts: getDaysPeriodFromNow(-MAIL_PERIOD)});
    const filteredProjects = projects.filter((project) => {
        const isMailed = mailLogs?.filter((maillog) =>
            maillog.user.toString() === project.get('author').toString() &&
            maillog.data.projectId.toString() === project._id.toString()
        ) || false;
        return !isMailed;
    });
    assert.notEqual(filteredProjects.length, 0);
};
