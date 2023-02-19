import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { dbPromise } from '@/server/modules/db';
import { SpecialtyGroupModel } from '@/server/schema/entities/SpecialtyGroupTC';
import { SpecialtyModel } from '@/server/schema/entities/SpecialtyTC';

const filepath = path.join(__dirname, 'data.txt');

const GROUP_TITLES = ['группа', 'коллектив', 'цех', 'визуальные эффекты'];
const TITLE_LANGUAGES = ['ru', 'en'];

interface Group {
    titles: Record<string, string>;
    items: Item[];
}

interface Item {
    titles: Record<string, string>;
}

function parseData() {
    const specialtiesData = fs.readFileSync(filepath, 'utf8').split('\n').filter((item) => Boolean(item.trim())) as string[];
    let currentGroup: Group | undefined = undefined;
    const data = specialtiesData.reduce((acc, item) => {
        const lowerItem = item.toLocaleLowerCase();
        const isTitle = GROUP_TITLES.some((part) => lowerItem.includes(part));
        const titles = item.split('=').reduce((acc, part, index) => ({...acc, [TITLE_LANGUAGES[index]]: part.trim()}), {});
        if (isTitle) {
            currentGroup = {
                titles,
                items: []
            };
            acc.push(currentGroup);
        } else {
            currentGroup?.items.push({
                titles
            });
        }
        return acc;
    }, [] as Group[]);
    return data;
}

const specialtiesData = parseData();

function prepareGroupData(): any[] {
    return specialtiesData.map((group) => {
        return {
            updateOne: {
                filter: { 'titles.ru': group.titles.ru },
                update: group,
                upsert: true
            }
        };
    });
}

function prepareSpecialtiesData(groups): any[] {
    const groupsMap = {};
    groups.forEach((group) => {
        groupsMap[group.get('titles.ru')] = group._id;
    });
    const specialties = specialtiesData.reduce((acc, group) => {
        return acc.concat(group.items.map((item) => ({...item, parentId: group.titles.ru})));
    }, [] as (Item & {parentId: string;})[]);
    return specialties.map((specialty) => {
        return {
            updateOne: {
                filter: { 'titles.ru': specialty.titles.ru },
                update: {
                    ...specialty,
                    group: groupsMap[specialty.parentId]
                },
                upsert: true
            }
        };
    });
}

dbPromise
    .then(() => SpecialtyGroupModel.collection.drop())
    .then(() => SpecialtyModel.collection.drop())
    .catch(() => {})
    .then(prepareGroupData)
    .then((bulkOps) => SpecialtyGroupModel.bulkWrite(bulkOps))
    .then(() => {
        console.log('BULK update OK');
    })
    .then(() => SpecialtyGroupModel.find())
    .then(prepareSpecialtiesData)
    .then((specialties) => SpecialtyModel.bulkWrite(specialties))
    .then(() => {
        console.log('BULK update OK');
    })
    .catch((err) => {
        console.log('BULK update error');
        console.log(JSON.stringify(err, null, 4));
    });
