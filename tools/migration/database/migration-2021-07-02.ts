import { UserModel } from "@/server/schema/entities/UserTC";

export const version = 4;

export default async function() {
    const users = await UserModel.find({'_subscription.level': 'start'});
    const updates = users.map((user) => {
        const filter = {_id: user._id};
        return {
            updateOne: {
                filter,
                update: {
                    '_subscription.quota.projects': 6,
                    '_subscription.quota.applications': 6,
                }
            }
        };
    });
    return UserModel.bulkWrite(updates);
}
