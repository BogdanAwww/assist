import '@/common/styles/reset.css';
import '@/common/styles/main.css';

import * as React from 'react';
import {render} from 'react-dom';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import routes from '@/admin/routes/routes';

import {ApolloProvider} from '@apollo/client';
import apolloClient from '@/common/core/apollo-client/apollo-client';

import config from './config';
import {HistoryProvider} from '@/common/utils/history-connect';
import StateProvider from '@/common/views/state-provider/state-provider';
import TranslatesProvider from '@/common/views/translates-provider/translates-provider';
import store from '@/admin/state/store';
import AppInitiator from '@/web/views/app-initiator/app-initiator';
import Notifications from '@/common/views/notification/notifications';

class App extends React.Component {
	private _renderRouter = (): React.ReactNode => {
		return (
			<Router basename={config.baseUrl}>
				<HistoryProvider>
					<Switch>
						{routes.map((routeProps, index) => (
							<Route {...routeProps} key={index} />
						))}
					</Switch>
				</HistoryProvider>
				<Notifications />
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
