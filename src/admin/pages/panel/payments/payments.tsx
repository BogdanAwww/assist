import './payments.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import notificationActions from '@/web/actions/notification-actions';
import {PaginationOutput} from '@/common/types';
import ItemsList from '@/common/views/items-list/items-list';
import {invoices} from '@/admin/actions/data-provider';
import {Invoice} from '@/admin/types';
import {User} from '@/common/types/user';

const mapDispatchToProps = {
	showNotification: notificationActions.showNotification
};

interface SelfProps {}

type ReduxProps = typeof mapDispatchToProps;

type Props = SelfProps & ReduxProps;

interface State {
	migrating?: boolean;
	data?: PaginationOutput<Invoice>;
}

const connect = ReactRedux.connect(null, mapDispatchToProps);

const b = classname('payments-page');

class PaymentsPage extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {};
	}

	private _load = (page?: number): void => {
		invoices({filter: {}, page, perPage: 10}).then((data) => {
			this.setState({data});
		});
	};

	private _openUser = (user: User): void => {
		window.open(`/profile/${user.username}`, '_blank');
	};

	private _renderLine = (invoice: Invoice): React.ReactNode => {
		const user = invoice.user;
		const date = new Date(invoice.updatedAt);
		return (
			<div className={b('line')} key={user._id}>
				<div className={b('line-name')} onClick={() => this._openUser(user)}>
					<div>{user.fullName}</div>
					<div className={b('line-username')}>{user.username}</div>
					<div>{user.email}</div>
				</div>
				<div className={b('line-email')}>
					{invoice.type === 'subscription'
						? 'Подписка'
						: invoice.type === 'subscription_upgrade'
						? 'Улучшение подписки'
						: invoice.type}
				</div>
				<div className={b('line-location')}>
					{invoice.data.price} RUB / {invoice.data.priceKZT} KZT
					{invoice.data.code ? <div>Промокод: {invoice.data.code}</div> : null}
				</div>
				<div className={b('line-subscription')}>{date.toLocaleString()}</div>
			</div>
		);
	};

	private _renderList = (): React.ReactNode => {
		return (
			<div className={b('list')}>
				<div className={b('line', {head: true})}>
					<div className={b('line-name')}>Пользователь</div>
					<div className={b('line-email')}>Тип</div>
					<div className={b('line-location')}>Сумма</div>
					<div className={b('line-subscription')}>Дата</div>
				</div>
				<ItemsList data={this.state.data} loadPage={this._load}>
					{this._renderLine}
				</ItemsList>
			</div>
		);
	};

	render(): React.ReactNode {
		return <div className={b()}>{this._renderList()}</div>;
	}
}

export default connect(PaymentsPage);
