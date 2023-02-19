import { Document } from 'mongoose';
import { MailLogModel } from '@/server/schema/entities/MailLogTC';
import { TemplateType } from '@/server/modules/mail/types';

export async function getMailLogs(template: TemplateType, params: any): Promise<any[]> {
    return await MailLogModel.find({template, ...params}).lean();
}

export async function filterMailedUsers(users: Document[], template: TemplateType, additional: any = {}): Promise<Document[]> {
    if (!users || users.length === 0) {
        return [];
    }
    const emails = users.map((user) => user.get('email')).filter(Boolean);
    if (!emails || emails.length === 0) {
        return [];
    }
    const mailLogs = await getMailLogs(template, {email: {$in: emails}, ...additional});
    const notNotifiedUsers = users.reduce((acc, user) => {
        const email = user.get('email');
        const logged = mailLogs.find((log) => log.email === email);
        if (email && !logged) {
            acc.push(user);
        }
        return acc;
    }, [] as Document[]);
    return notNotifiedUsers;
}

export const MINUTE = 60 * 1000;
export const DAY = 24 * 60 * 60 * 1000;

export function addMinutesFromNow(minutes: number) {
    const now = new Date().getTime();
    return now + minutes * MINUTE;
}

export function addDayFromNow(days: number) {
    const now = new Date().getTime();
    return now + days * DAY;
}

export function getMinutesPeriodFromNow(fromNow: number, toNow?: number) {
    const filter: any = {
        $gt: addMinutesFromNow(fromNow)
    };
    if (typeof toNow === 'number') {
        filter.$lt = addMinutesFromNow(toNow);
    }
    return filter;
}

export function getDaysPeriodFromNow(fromNow: number, toNow?: number) {
    const filter: any = {
        $gt: addDayFromNow(fromNow)
    };
    if (typeof toNow === 'number') {
        filter.$lt = addDayFromNow(toNow);
    }
    return filter;
}
