import { UserModel } from '../../../src/server/schema/entities/UserTC';
import { getTranslation } from '@/server/modules/translates';
import { ProjectModel } from '@/server/schema/entities/ProjectTC';
import { PortfolioProjectModel } from '@/server/schema/entities/PortfolioProjectTC';

export const version = 7;

export default async function() {
    await updateUsers();
    await updateProjects();
    await updatePortfolioProjects();
}

async function updateUsers() {
    const users = await UserModel.find();
    const updates = await users.reduce((promise, user) => {
        return promise.then(async (updates) => {
            const filter = {_id: user.get('_id')};
            const update = {} as any;
            await Promise.all([
                updateField(user, 'firstName', 'firstname_en', update, true),
                updateField(user, 'lastName', 'lastname_en', update, true),
                updateField(user, 'description', 'description_en', update)
            ]);
            if (Object.keys(update).length > 0) {
                updates.push({
                    updateOne: {
                        filter,
                        update,
                        upsert: false
                    }
                });
                await sleep();
            }
            return updates;
        });
    }, Promise.resolve([]));

    if (updates.length > 0) {
        await UserModel.bulkWrite(updates);
    }
}

async function updateProjects() {
    const projects = await ProjectModel.find();
    const updates = await projects.reduce((promise, project) => {
        return promise.then(async (updates) => {
            const filter = {_id: project.get('_id')};
            const update = {} as any;
            await Promise.all([
                updateField(project, 'title', 'title_en', update),
                updateField(project, 'description', 'description_en', update),
            ]);
            if (Object.keys(update).length > 0) {
                updates.push({
                    updateOne: {
                        filter,
                        update,
                        upsert: false
                    }
                });
                await sleep();
            }
            return updates;
        });
    }, Promise.resolve([]));

    if (updates.length > 0) {
        await ProjectModel.bulkWrite(updates);
    }
}

async function updatePortfolioProjects() {
    const projects = await PortfolioProjectModel.find();
    const updates = await projects.reduce((promise, project) => {
        return promise.then(async (updates) => {
            const filter = {_id: project.get('_id')};
            const update = {} as any;
            await Promise.all([
                updateField(project, 'title', 'title_en', update),
                updateField(project, 'description', 'description_en', update),
                updateField(project, 'responsibilities', 'responsibilities_en', update),
            ]);
            if (Object.keys(update).length > 0) {
                updates.push({
                    updateOne: {
                        filter,
                        update,
                        upsert: false
                    }
                });
                await sleep();
            }
            return updates;
        });
    }, Promise.resolve([]));

    if (updates.length > 0) {
        await PortfolioProjectModel.bulkWrite(updates);
    }
}

async function updateField(obj: any, field: string, enField: string, update: any, translit?: boolean): Promise<void> {
    const value = obj[field];
    if (obj[enField]) {
        return;
    }
    if (value && value.match(/[а-яА-ЯёЁйЙ]*/g)) {
        update[enField] = await getTranslation(value, 'en', translit);
    }
}

async function sleep(ms = 200) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms);
    });
}
