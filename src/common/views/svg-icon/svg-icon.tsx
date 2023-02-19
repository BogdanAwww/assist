import './svg-icon.css';

import * as React from 'react';
import {isEqual} from 'lodash-es';
import classname from '@/common/core/classname';
import request from '@/common/core/request/request';
import asyncAction, {AsyncAction} from '@/common/core/async-action/async-action';

interface Props {
	url: string;
	className?: string;
	width?: number;
	height?: number;
	noFill?: boolean;
	stroke?: boolean;
}

interface State {
	loaded: boolean;
}

const cache: Record<string, string> = {};
const requests: Record<string, Promise<string>> = {};

const b = classname('svg-icon');

class SvgIcon extends React.PureComponent<Props, State> {
	private _loadAction?: AsyncAction;

	constructor(props) {
		super(props);

		this.state = {
			loaded: false
		};
	}

	componentDidMount() {
		this._load();
	}

	componentDidUpdate(props: Props, state: State) {
		if (!isEqual(this.props, props) || !isEqual(this.state, state)) {
			this._load();
		}
	}

	componentWillUnmount() {
		asyncAction.cancel(this._loadAction);
	}

	private _load() {
		asyncAction.cancel(this._loadAction);

		const url = this.props.url;
		if (cache[url]) {
			this.setState({loaded: true});
			return;
		}

		if (!requests[url]) {
			requests[url] = request<string>({url, parser: 'string'});
			requests[url].then(
				(res) => (cache[url] = res),
				() => delete requests[url]
			);
		}

		this._loadAction = asyncAction.create(requests[url], {
			success: () => this.setState({loaded: true}),
			fail: (error) => console.log(error)
		});
	}

	render() {
		const props = this.props;
		const className = [
			b({
				fill: !props.noFill,
				stroke: props.stroke
			}),
			props.className
		]
			.filter(Boolean)
			.join(' ');
		return (
			<div
				className={className}
				style={{width: props.width, height: props.height}}
				dangerouslySetInnerHTML={{__html: cache[props.url] || ''}}
			/>
		);
	}
}

export default SvgIcon;
