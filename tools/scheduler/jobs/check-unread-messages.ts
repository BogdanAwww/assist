import { UserModel } from "@/server/schema/entities/UserTC";
import mailgunMailer from '@/server/modules/mail';
import { getHostUrl } from "@/server/utils/host-utils";
import { uniq } from "lodash";
import { filterMailedUsers, getDaysPeriodFromNow, getMinutesPeriodFromNow } from '../utils';
import { ChatMessageModel } from '@/server/schema/entities/ChatMessageTC';
import { ChatRoomModel } from '@/server/schema/entities/ChatRoomTC';

const PERIOD = 5;
const PERIOD_BEFORE = PERIOD + 5;

export default async function() {
    const messages = await ChatMessageModel.find({
        createdAt: getMinutesPeriodFromNow(-PERIOD_BEFORE, -PERIOD),
        readBy: {$size: 0}
    });
    const roomsIds = uniq(messages.map((message) => message.get('room').toString()));
    if (roomsIds.length === 0) {
        return;
    }
    const rooms = await ChatRoomModel.find({_id: {$in: roomsIds}});
    const authorIdByRoomId = {};
    messages.forEach((message) => {
        const roomId = message.get('room').toString();
        const userId = message.get('author').toString();
        authorIdByRoomId[roomId] = userId;
    });

    const usersIds = rooms.map((room) => {
        const ids = (room.get('users') || []).map((userId) => userId.toString());
        return ids.filter((id) => id !== authorIdByRoomId[room._id.toString()])[0];
    });
    if (usersIds.length === 0) {
        return;
    }

    const users = await UserModel.find({_id: {$in: usersIds}});
    const notNotifiedUsers = await filterMailedUsers(users, 'unread-messages', {ts: getDaysPeriodFromNow(-PERIOD)});
    if (notNotifiedUsers.length === 0) {
        return;
    }

    notNotifiedUsers.forEach((user) => {
        const email = user.get('email');
        mailgunMailer.send('unread-messages', email, {
            link: getHostUrl() + '/chat'
        });
    });
};
