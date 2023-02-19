import React from 'react';
import * as ReactRedux from 'react-redux';
import composeConnect from '@/common/core/compose/compose';
import historyConnect, {HistoryProps} from '@/common/utils/history-connect';
import appActions from '@/web/actions/app-actions';

const mapDispatchToProps = {
	signout: appActions.signout
};

type ReduxProps = typeof mapDispatchToProps;

type Props = ReduxProps & HistoryProps;

const connect = composeConnect<{}, ReduxProps, HistoryProps>(
	ReactRedux.connect(null, mapDispatchToProps),
	historyConnect
);

class SignOutPage extends React.Component<Props> {
	componentDidMount() {
		const props = this.props;
		props.signout();
		props.history.push('/signin');
	}

	render() {
		return <div />;
	}
}

export default connect(SignOutPage);
