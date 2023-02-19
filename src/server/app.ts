import {addAlias} from 'module-alias';
addAlias('@/server', __dirname);

import config, {environment} from '@/server/config';
import express from 'express';

import * as Sentry from '@sentry/node';

// middlewares
import {express as voyagerMiddleware} from 'graphql-voyager/middleware';
import passport, {authBy} from '@/server/middleware/passport';
import apolloMiddleware from '@/server/middleware/apollo';
import adminApolloMiddleware from './middleware/admin';

// modules
import '@/server/modules/db';
import cors from '@/server/modules/cors';
import pubsubService from '@/server/modules/pubsub';
import cloudpayments from '@/server/modules/cloudpayments';
import {queueManager} from './modules/queue';

const app = express();

queueManager.init(false);

Sentry.init({
	environment,
	dsn: 'https://616712e3547a42daa7790bbe25553de8@o508731.ingest.sentry.io/5601678'
});

app.use(Sentry.Handlers.requestHandler());

app.use('/voyager', voyagerMiddleware({endpointUrl: '/graphql'}));
app.use('/kr4m0a/voyager', voyagerMiddleware({endpointUrl: '/kr4m0a/graphql'}));

app.use(passport.initialize());
app.get('/facebook/auth', passport.authenticate('facebook', {scope: 'email'}));
app.get('/facebook/callback', authBy('facebook'));
app.get('/google/auth', passport.authenticate('google', {scope: ['profile', 'email']}));
app.get('/google/callback', authBy('google'));

app.post('/cloudpayments/*', cors, cloudpayments);

app.use(express.urlencoded({extended: true}));
app.use(express.json());
apolloMiddleware(app);
app.use(adminApolloMiddleware);

app.use(Sentry.Handlers.errorHandler());
app.use('*', (_req, res) => res.end());

const server = app.listen(config.port, () => {
	console.log(`🚀 Server ready! Pid: ${process.pid}
        http://localhost:${config.port}
        http://localhost:${config.port}/voyager
    `);

	pubsubService.init(server);
});
