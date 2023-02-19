import Queue from 'bee-queue';
import { queueManager } from '@/server/modules/queue';
import { ProjectModel } from '@/server/schema/entities/ProjectTC';
import { userFindMany } from '@/server/vendor/user/userFindMany';
import mailgunMailer from '@/server/modules/mail';
import { getHostUrl } from '@/server/utils/host-utils';

queueManager.init(true);

queueManager.proccessJob('PROJECT_CREATED', processProjectCreatedJob);

const notificationQueue = queueManager.getQueue('NOTIFICATIONS', {isWorker: false, getEvents: false});

async function processProjectCreatedJob({data}: Queue.Job<{_id: string}>, done: Queue.DoneCallback<any>): Promise<void> {
    const project = await ProjectModel.findOne({_id: data._id}).lean() as any;
    if (project.status !== 'active') {
        console.log('not active');
        done(null);
        return;
    }
    const users = await userFindMany({
        filter: {
            _id: {$ne: project.author},
            specialties: project.specialties
        },
        showContacts: true
    });
    if (users.length === 0) {
        console.log('no users');
        done(null);
        return;
    }
    users.forEach((user) => {
        const email = user.get('email');
        notificationQueue.createJob({
            id: user._id,
            type: 'project-for-contractor',
            data: {
                project: {type: 'Project', id: project._id}
            }
        }).save();
        mailgunMailer.send('project-for-contractor', email, {
            projectTitle: project.title,
            link: getHostUrl(`/project/${project._id}?role=contractor`)
        });
    });
    done(null);
}
