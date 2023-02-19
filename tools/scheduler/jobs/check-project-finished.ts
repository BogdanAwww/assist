import { Document } from 'mongoose';
import { ProjectModel } from '@/server/schema/entities/ProjectTC';
import { getDaysPeriodFromNow, getMailLogs, addDayFromNow } from '../utils';
import { UserModel } from '@/server/schema/entities/UserTC';
import mailgunMailer from '@/server/modules/mail';

const DAYS_BEFORE = -3;

export default async function() {
    const filter = getDaysPeriodFromNow(DAYS_BEFORE, -1);
    const projects = await ProjectModel.find({
        createdAt: {$lt: addDayFromNow(-1)},
        $or: [
            {status: 'archived', updatedAt: filter},
            {endDate: filter}
        ]
    });
    const projectIds = projects.map((project) => project._id.toString());
    const logs = await getMailLogs('project-finished', {
        ts: getDaysPeriodFromNow(DAYS_BEFORE),
        'data.projectId': {$in: projectIds}
    });
    const filteredProjects = projects.reduce((acc, project) => {
        const projectId = project._id.toString();
        const log = logs.find((log: any) => log.data.projectId.toString() === projectId);
        if (!log) {
            acc.push(project);
        }
        return acc;
    }, [] as Document[]);
    if (filteredProjects.length === 0) {
        console.log('no projects to ask feedback');
        return;
    }

    const userIds = filteredProjects.map((project) => project.get('author'));
    const users = await UserModel.find({_id: {$in: userIds}});
    filteredProjects.forEach((project) => {
        const user = users.find((user) => user._id.toString() === project.get('author').toString());
        if (user) {
            const email = user.get('email');
            console.log(`sent remember verification mail to ${email}`);
            mailgunMailer.send('project-finished', email, {
                projectId: project._id.toString(),
                projectTitle: project.get('title')
            }, {from: 'feedback'});
        }
    });
};
