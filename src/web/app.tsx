import '@/common/styles/reset.css';
import '@/common/styles/main.css';

import * as React from 'react';
import {render} from 'react-dom';
import {Router, Switch, Route} from 'react-router-dom';
import routes from '@/web/routes/routes';

import {ApolloProvider} from '@apollo/client';
import apolloClient from '@/common/core/apollo-client/apollo-client';

import config from './config';
import history from '@/common/core/history';
import {HistoryProvider} from '@/common/utils/history-connect';
import StateProvider from '@/common/views/state-provider/state-provider';
import TranslatesProvider from '@/common/views/translates-provider/translates-provider';
import store from './state/store';
import AppInitiator from '@/web/views/app-initiator/app-initiator';
import Notifications from '@/common/views/notification/notifications';
import ChatSidebar from '@/web/views/chat/chat-sidebar/chat-sidebar';
import CookiesView from '@/web/views/cookies-view/cookies-view';
import Dialogs from './views/dialogs/dialogs';

import * as Sentry from '@sentry/react';
import {Integrations} from '@sentry/tracing';

import GoogleAnalytics from '@/common/views/google-analytics/google-analytics';
import {CustomEventProvider} from '@/common/utils/custom-event-connect';
import {rememberUTMS} from '@/common/utils/utm-parser';

history.init(config.baseUrl);
rememberUTMS();

const RELEASE = `web@${VERSION}`;

console.log('RELEASE', RELEASE);

Sentry.init({
	environment: config.env,
	release: RELEASE,
	dsn: 'https://feefc54d8e9f4d49a7d5407e25d89115@o508731.ingest.sentry.io/5601658',
	autoSessionTracking: true,
	integrations: [new Integrations.BrowserTracing()],
	tracesSampleRate: 1.0
});

class App extends React.Component {
	private _renderRouter = (): React.ReactNode => {
		return (
			<Router history={history.get()}>
				<CustomEventProvider>
					<HistoryProvider>
						<Switch>
							{routes.map((routeProps, index) => (
								<Route {...routeProps} key={index} />
							))}
						</Switch>
					</HistoryProvider>
				</CustomEventProvider>
				<Notifications />
				<ChatSidebar />
				<Dialogs />
				<GoogleAnalytics id={config.gtag} />
				<CookiesView />
			</Router>
		);
	};

	render() {
		return (
			<ApolloProvider client={apolloClient}>
				<StateProvider store={store}>
					<TranslatesProvider>
						<AppInitiator children={this._renderRouter()} />
					</TranslatesProvider>
				</StateProvider>
			</ApolloProvider>
		);
	}
}

render(<App />, document.getElementById('app'));
