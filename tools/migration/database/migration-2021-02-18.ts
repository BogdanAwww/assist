import { UserModel } from "@/server/schema/entities/UserTC";

export const version = 2;

export default async function() {
    const users = await UserModel.find({'_subscription.level': 'pro'});
    const updates = users.map((user) => {
        const filter = {_id: user._id};
        return {
            updateOne: {
                filter,
                update: {_subscription: null}
            }
        };
    });
    return UserModel.bulkWrite(updates);
}
