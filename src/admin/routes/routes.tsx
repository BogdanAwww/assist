import * as React from 'react';
import {RouteProps} from 'react-router-dom';
// import loadable from '@/common/core/loadable';

import AdminHeader from '@/admin/views/admin-header/admin-header';
import SignOutPage from '@/common/pages/signout/signout';

// layouts
import Page from '@/common/views/page/page';

// pages
import SignInPage from '@/admin/pages/signin/signin';
import RouteGuard from '@/common/views/route-guard/route-guard';
import PanelPage from '@/admin/pages/panel/panel';

// const KitPage = loadable(() => import(/* webpackChunkName: 'kit' */'@/admin/pages/kit/kit'));

const isLogged = (state) => Boolean(state.viewer);
const isNotLogged = (state) => !isLogged(state);

const routes: RouteProps[] = [
	{
		path: '/signout',
		component: SignOutPage
	},
	{
		path: '/panel',
		render: () => (
			<RouteGuard check={isNotLogged} redirectTo="/">
				<Page fill header={<AdminHeader />} children={<PanelPage />} />
			</RouteGuard>
		)
	},
	{
		path: '/',
		render: () => (
			<RouteGuard check={isLogged} redirectTo="/panel">
				<Page children={<SignInPage />} />
			</RouteGuard>
		)
	}
];

export default routes;
