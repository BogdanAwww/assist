import { UserModel } from '../../../src/server/schema/entities/UserTC';
import normalizeEmail from 'normalize-email';

export const version = 6;

export default async function() {
    const users = await UserModel.find();
    const updates = users.map((user) => {
        const filter = {_id: user.get('_id')};
        const email = user.get('email');
        return {
            updateOne: {
                filter,
                update: {
                    normalizedEmail: email ? normalizeEmail(email) : null
                },
                upsert: false
            }
        };
    });
    return UserModel.bulkWrite(updates);
}
