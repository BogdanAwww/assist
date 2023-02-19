import * as React from 'react';
import {Redirect, RouteProps} from 'react-router-dom';
import AppState from '../state/app-state';
// import loadable from '@/common/core/loadable';
// const KitPage = loadable(() => import(/* webpackChunkName: 'kit' */'@/admin/pages/kit/kit'));

import UserHeader from '@/web/views/user-header/user-header';
import RouteGuard from '@/common/views/route-guard/route-guard';
import IsRole from '@/common/views/is-role/is-role';
import StateVariable from '@/common/views/redux-state/state-variable';
import SignOutPage from '@/common/pages/signout/signout';

// layouts
import Page from '@/common/views/page/page';

// pages
import AuthPage from '@/web/pages/auth/auth';
import SignInPage from '@/web/pages/signin/signin';
import SignUpPage from '@/web/pages/signup/signup';
import VerifyAccount from '@/web/pages/verify-account/verify-account';
import ChooseRolePage from '@/web/pages/choose-role/choose-role';
import ForgotPasswordPage from '@/web/pages/forgot-password/forgot-password';
import RestorePasswordPage from '@/web/pages/restore-password/restore-password';
import SubscriptionChoosePage from '@/web/pages/subscription/choose/subscription-choose';
import FavoritesPage from '@/web/pages/favorites/favorites';
import UserCardPage from '@/common/views/user-card-page/user-card-page';
import SettingsPage from '@/web/pages/settings/settings';
import ChatPage from '@/web/pages/chat/chat';
import FAQPage from '@/web/pages/faq/faq';
import PromoDialog from '@/web/views/promo-dialog/promo-dialog';

import PortfolioListPage from '@/web/pages/contractor/portfolio/list/portfolio-list';
import PortfolioEditPage from '@/web/pages/contractor/portfolio/edit/portfolio-edit';

// contractor pages
import ProjectSuitablePage from '@/web/pages/contractor/project/suitable/project-suitable';
import ProjectSearchPage from '@/web/pages/contractor/project/search/project-search';
import ContractorProjectViewPage from '@/web/pages/contractor/project/view/project-view';
import ContractorProjectApplyPage from '@/web/pages/contractor/project/apply/project-apply';
import ApplicationsListPage from '@/web/pages/contractor/applications/list/applications-list';

// employer pages
import EmployerProjectAddPage from '@/web/pages/employer/project/add/project-add';
import EmployerProjectViewPage from '@/web/pages/employer/project/view/project-view';
import EmployerContractorSearchPage from '@/web/pages/employer/contractor/search/contractor-search';
import EmployerContractorViewPage from '@/web/pages/employer/contractor/view/contractor-view';
import EmployerContractorInvitePage from '@/web/pages/employer/contractor/invite/contractor-invite';

const isLogged = (state: AppState) => Boolean(state.viewer);
const isNotLoggedOrNotVerified = (state: AppState) => !isLogged(state) || !state.viewer?.verified;
const isNotLogged = (state: AppState) => !isLogged(state);

// function baseViewerCheck(state: AppState) {
// 	if (isNotLogged(state)) {
// 		return '/signin';
// 	}
// 	return false;
// }

function chooseRoleCheck(state: AppState) {
	if (isNotLogged(state)) {
		return '/signin';
	}
	if (isNotLoggedOrNotVerified(state)) {
		return '/choose-role';
	}

	return false;
}

function isLoggedAndSubscriptionCheck(state: AppState) {
	if (isNotLogged(state)) {
		return '/signin';
	}
	if (isNotLoggedOrNotVerified(state)) {
		return '/choose-role';
	}
	return false;
}

const routes: RouteProps[] = [
	{
		path: '/auth',
		render: () => <AuthPage />
	},
	{
		path: '/signin',
		render: () => (
			<RouteGuard check={isLogged} redirectTo="/choose-role">
				<Page children={<SignInPage />} />
			</RouteGuard>
		)
	},
	{
		path: '/signup',
		render: () => (
			<RouteGuard check={isLogged} redirectTo="/choose-role">
				<Page children={<SignUpPage />} />
			</RouteGuard>
		)
	},
	{
		path: '/forgot-password',
		render: () => (
			<RouteGuard check={isLogged} redirectTo="/choose-role">
				<Page children={<ForgotPasswordPage />} />
			</RouteGuard>
		)
	},
	{
		path: '/restore-password',
		render: () => <Page children={<RestorePasswordPage />} />
	},
	{
		path: '/signout',
		component: SignOutPage
	},
	{
		path: '/verify',
		render: () => <Page children={<VerifyAccount />} />
	},
	{
		path: '/choose-role',
		render: () => (
			<RouteGuard check={chooseRoleCheck}>
				<Page children={<ChooseRolePage />} />
			</RouteGuard>
		)
	},
	{
		path: '/portfolio',
		exact: true,
		render: () => (
			<RouteGuard check={isLoggedAndSubscriptionCheck}>
				<Page fill header={<UserHeader />}>
					<UserCardPage>
						<PortfolioListPage />
					</UserCardPage>
				</Page>
			</RouteGuard>
		)
	},
	{
		path: '/portfolio/add',
		render: () => (
			<RouteGuard check={isLoggedAndSubscriptionCheck}>
				<Page fill header={<UserHeader />}>
					<UserCardPage>
						<PortfolioEditPage />
					</UserCardPage>
				</Page>
			</RouteGuard>
		)
	},
	{
		path: '/portfolio/:id/edit',
		render: () => (
			<RouteGuard check={isLoggedAndSubscriptionCheck}>
				<Page fill header={<UserHeader />}>
					<UserCardPage>
						<PortfolioEditPage />
					</UserCardPage>
				</Page>
			</RouteGuard>
		)
	},
	{
		path: '/search',
		render: () => (
			<RouteGuard check={isLoggedAndSubscriptionCheck}>
				<Page header={<UserHeader />} fill>
					<UserCardPage>
						<IsRole equal="contractor">
							<ProjectSearchPage />
						</IsRole>
						<IsRole equal="employer">
							<EmployerContractorSearchPage />
						</IsRole>
					</UserCardPage>
					<PromoDialog />
				</Page>
			</RouteGuard>
		)
	},
	{
		path: '/project/:id',
		exact: true,
		render: (props) => (
			<Page header={<UserHeader />} fill>
				<UserCardPage key={props.history.location.pathname}>
					<IsRole equal="employer" else={<ContractorProjectViewPage />}>
						<EmployerProjectViewPage />
					</IsRole>
				</UserCardPage>
			</Page>
		)
	},
	{
		path: '/project/:id/apply',
		exact: true,
		render: () => (
			<RouteGuard check={isLoggedAndSubscriptionCheck}>
				<Page header={<UserHeader />} fill>
					<UserCardPage>
						<ContractorProjectApplyPage />
					</UserCardPage>
				</Page>
			</RouteGuard>
		)
	},
	{
		path: '/project/:id/edit',
		exact: true,
		render: () => (
			<RouteGuard check={isLoggedAndSubscriptionCheck}>
				<Page header={<UserHeader />} fill>
					<UserCardPage>
						<EmployerProjectAddPage hideList />
					</UserCardPage>
				</Page>
			</RouteGuard>
		)
	},
	{
		path: '/settings',
		render: () => (
			<RouteGuard check={isNotLogged} redirectTo="/signin">
				<Page header={<UserHeader />} padding>
					<SettingsPage />
				</Page>
			</RouteGuard>
		)
	},
	{
		path: '/profile/:username',
		exact: true,
		render: (props) => (
			<Page header={<UserHeader />} fill>
				<UserCardPage>
					<EmployerContractorViewPage key={props.history.location.key} />
				</UserCardPage>
			</Page>
		)
	},
	{
		path: '/profile/:username/invite',
		exact: true,
		render: () => (
			<RouteGuard check={isLoggedAndSubscriptionCheck}>
				<Page header={<UserHeader />} fill>
					<UserCardPage>
						<EmployerContractorInvitePage />
					</UserCardPage>
				</Page>
			</RouteGuard>
		)
	},
	{
		path: '/chat',
		exact: true,
		render: () => (
			<RouteGuard check={isLoggedAndSubscriptionCheck}>
				<StateVariable<boolean> get={(state) => Boolean(state.isMobileLayout)}>
					{(isMobileLayout) => (
						<Page header={<UserHeader hideRoleButtons={isMobileLayout} />} fill hideFooter={isMobileLayout}>
							<UserCardPage>
								<ChatPage />
							</UserCardPage>
						</Page>
					)}
				</StateVariable>
			</RouteGuard>
		)
	},
	{
		path: '/chat/:roomId',
		render: () => (
			<RouteGuard check={isLoggedAndSubscriptionCheck}>
				<StateVariable<boolean> get={(state) => Boolean(state.isMobileLayout)}>
					{(isMobileLayout) => (
						<Page header={<UserHeader hideRoleButtons={isMobileLayout} />} fill hideFooter={isMobileLayout}>
							<UserCardPage>
								<ChatPage />
							</UserCardPage>
						</Page>
					)}
				</StateVariable>
			</RouteGuard>
		)
	},
	{
		path: '/applications',
		render: () => (
			<RouteGuard check={isLoggedAndSubscriptionCheck}>
				<Page header={<UserHeader />} fill>
					<UserCardPage>
						<ApplicationsListPage />
					</UserCardPage>
				</Page>
			</RouteGuard>
		)
	},
	{
		path: '/subscription',
		render: () => (
			<RouteGuard check={isLogged}>
				<Page
					header={<UserHeader hideRole closeBackUrl="/settings" />}
					padding
					children={<SubscriptionChoosePage />}
				/>
			</RouteGuard>
		)
	},
	{
		path: '/favorites',
		render: () => (
			<RouteGuard check={isLoggedAndSubscriptionCheck}>
				<Page
					fill
					header={<UserHeader closeBackUrl="/choose-role" />}
					padding
					staticFooter
					children={<FavoritesPage />}
				/>
			</RouteGuard>
		)
	},
	{
		path: '/projects',
		render: (props) => (
			<RouteGuard check={isLoggedAndSubscriptionCheck}>
				<Page header={<UserHeader />} fill>
					<UserCardPage>
						<IsRole equal="contractor">
							<ProjectSuitablePage />
						</IsRole>
						<IsRole equal="employer">
							<EmployerProjectAddPage key={props.history.location.key} />
						</IsRole>
					</UserCardPage>
				</Page>
				<PromoDialog />
			</RouteGuard>
		)
	},
	{
		path: '/faq/:id?',
		render: () => (
			<Page header={<UserHeader />} staticFooter>
				<FAQPage />
			</Page>
		)
	},
	{
		path: '/',
		render: () => <Redirect to="/search" />
	}
];

export default routes;
