import mongoose from 'mongoose';
import mongooseBeautifulUniqueValidation from 'mongoose-beautiful-unique-validation';
import URIBuilder from 'mongo-uri-builder';
import config, {isDevEnv} from '@/server/config';

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('debug', isDevEnv);

mongoose.plugin(mongooseBeautifulUniqueValidation);

const uri = URIBuilder(config.db);

console.log(`[DB] URI: ${uri}`);

export const dbPromise = mongoose
	.connect(uri, {authSource: 'admin'})
	.then(() => console.log('[DB] Connected'))
	.catch((error) => console.log(error));

process.on('SIGINT', () => {
	mongoose.disconnect().then(() => {
		process.exit();
	});
});
