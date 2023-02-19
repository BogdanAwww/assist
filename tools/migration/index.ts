import fs from 'fs';
import path from 'path';
import { dbPromise } from '@/server/modules/db';
import { SystemModel } from '@/server/schema/entities/SystemTC';

const SCRIPT_REGEXP = /\.ts$/;

const SCRIPTS_PATH = path.resolve(__dirname, './database');

interface UpgradeScript {
    version: number;
    default: () => Promise<any>;
}

function getScripts(): UpgradeScript[] {
    const files = fs.readdirSync(SCRIPTS_PATH) || [];
    return files
        .reduce((acc, filename) => {
            if (SCRIPT_REGEXP.test(filename)) {
                const script = require(path.resolve(SCRIPTS_PATH, filename));
                if (script && script.version && script.default) {
                    return [...acc, script as UpgradeScript];
                }
            }
            return acc;
        }, [])
        .sort((a, b) => a.version - b.version);
}

dbPromise
    .then(() => SystemModel.findOne().lean<any>())
    .then((system) => {
        const version = system?.version || 0;
        const allScripts = getScripts();
        const scripts = allScripts.filter((script) => script.version > version);
        return scripts.reduce((prom, script) => prom.then(() => {
            console.log(`upgrading database from version ${version} to ${script.version}`);
            return script.default()
                .then(() => SystemModel.updateOne({}, {version: script.version}, {upsert: true}));
        }), Promise.resolve() as Promise<any>);
    })
    .catch((error) => {
        console.log('failed upgrade');
        console.log(error);
    })
    .finally(process.exit);
