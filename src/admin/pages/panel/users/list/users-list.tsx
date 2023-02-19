import './users-list.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
// import Button from '@/common/views/button/button';
// import FilePicker from '@/common/views/file-picker/file-picker';
// import upload from '@/web/utils/upload/upload';
import {getUsers} from '@/admin/actions/data-provider';
import notificationActions from '@/web/actions/notification-actions';
import {PaginationOutput} from '@/common/types';
import {User} from '@/common/types/user';
import ItemsList from '@/common/views/items-list/items-list';
import SubscriptionBadge from '@/common/views/subscription-badge/subscription-badge';
import composeConnect from '@/common/core/compose/compose';
import {withRouter, RouteComponentProps} from 'react-router';
import Input from '@/common/views/input/input';
import Button from '@/common/views/button/button';
import Checkbox from '@/common/views/checkbox/checkbox';
import {updateUser} from '@/web/actions/data-provider';

const mapDispatchToProps = {
	showNotification: notificationActions.showNotification
};

interface SelfProps {}

type ReduxProps = typeof mapDispatchToProps;

type Props = SelfProps & ReduxProps & RouteComponentProps;

interface State {
	search: string;
	migrating?: boolean;
	data?: PaginationOutput<User>;
}

const connect = composeConnect<SelfProps, ReduxProps, RouteComponentProps>(
	ReactRedux.connect(null, mapDispatchToProps),
	withRouter
);

const b = classname('users-list-page');

class UsersListPage extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			search: ''
		};
	}

	private _load = (page?: number): void => {
		const $search = this.state.search;
		// const filter = $search ? {$text: {$search}} : {};
		const filter = $search
			? {
					$or: [
						{email: $search},
						{
							$expr: {
								$regexMatch: {
									input: {$concat: ['$firstName', ' ', '$lastName']},
									regex: $search,
									options: 'i'
								}
							}
						}
					]
			  }
			: {};

		console.log(filter);
		getUsers({filter, page, perPage: 10}).then((data) => {
			this.setState({data});
		});
	};

	private _search = (): void => {
		this._load();
	};

	// private _importUsers = (file: File) => {
	// 	const props = this.props;
	// 	if (!this.state.migrating) {
	// 		this.setState({migrating: true});
	// 		upload('document', file)
	// 			.then((upload) => {
	// 				if (upload) {
	// 					importUsersFromXLSX({id: upload._id})
	// 						.then((data) => {
	// 							if (data) {
	// 								props.showNotification({
	// 									view: 'success',
	// 									text: [
	// 										`Всего: ${data.total}`,
	// 										`Подходящих: ${data.prepared}`,
	// 										`Импортированно: ${data.inserted}`,
	// 										`Пропущенно: ${data.skipped}`,
	// 										`С ошибками: ${data.errors}`
	// 									].join('\n'),
	// 									timeout: 10000
	// 								});
	// 							} else {
	// 								props.showNotification({
	// 									view: 'error',
	// 									text: 'Ничего не импортированно.',
	// 									timeout: true
	// 								});
	// 							}
	// 						})
	// 						.catch(() => {
	// 							props.showNotification({
	// 								view: 'error',
	// 								text: 'Ничего не импортированно.',
	// 								timeout: true
	// 							});
	// 						});
	// 				}
	// 			})
	// 			.finally(() => {
	// 				this.setState({migrating: false});
	// 			});
	// 	}
	// };

	private _renderLine = (user: User): React.ReactNode => {
		const date = user.subscription?.end ? new Date(user.subscription.end) : undefined;
		const utms = (user as any)._info?.utms || {};
		console.log(this.state);
		return (
			<div
				className={b('user')}
				key={user._id}
				onClick={() => this.props.history.push(`/panel/user/${user.username}`)}
			>
				<div className={b('user-name')}>
					<div>{user.fullName}</div>
					<div className={b('user-username')}>{user.username}</div>
				</div>
				<div className={b('user-email')}>{user.email}</div>
				<div className={b('user-location')}>{user.city?.localeFullName}</div>
				<div className={b('user-subscription')}>
					<div>
						<SubscriptionBadge user={user} />
						{date ? ' до ' + date.toLocaleDateString() : null}
					</div>
					<div>{(user as any).verified === false ? 'Неподтвержденный' : 'Подтвердил почту'}</div>
					<div>{utms.utm_source ? 'Источник: ' + utms.utm_source : null}</div>
				</div>
				<Checkbox
					name="isVerified"
					value={user.isVerified}
					setFieldValue={() => {
						updateUser({username: user.username, isVerified: !user.isVerified}).then(() => {
							document.location.reload();
						});
					}}
				/>
			</div>
		);
	};

	private _renderList = (): React.ReactNode => {
		return (
			<div className={b('list')}>
				<div className={b('user', {head: true})}>
					<div className={b('user-name')}>Имя / username</div>
					<div className={b('user-email')}>Email</div>
					<div className={b('user-location')}>Город</div>
					<div className={b('user-subscription')}>Подписка</div>
					<div>Верификация</div>
				</div>
				<ItemsList data={this.state.data} loadPage={this._load}>
					{this._renderLine}
				</ItemsList>
			</div>
		);
	};

	render(): React.ReactNode {
		const total = this.state.data?.count || 0;
		return (
			<div className={b()}>
				<div className={b('head')}>
					<div>Всего: {total}</div>
					{/* <FilePicker onChange={this._importUsers}>
						{({onClick}) => <Button text="Импорт XLSX" disabled={this.state.migrating} onClick={onClick} />}
					</FilePicker> */}
					<div className={b('filter')}>
						<Input
							value={this.state.search}
							placeholder="Поиск"
							onChange={(e) => this.setState({search: e.target.value})}
						/>
						<div>
							<Button text="Искать" onClick={this._search} />
						</div>
					</div>
				</div>
				{this._renderList()}
			</div>
		);
	}
}

export default connect(UsersListPage);
