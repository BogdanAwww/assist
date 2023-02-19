import * as React from 'react';
import Fuse from 'fuse.js';
import Input from '../input/input';

interface SelfProps<T> {
	className?: string;
	placeholder?: string;
	options: T[];
	keys: string[];
	children: (params: {value: string; items: T[]}) => React.ReactNode;
}

type Props<T> = SelfProps<T>;

interface State {
	value: string;
}

class FuseSearch<T extends Record<string, any>> extends React.PureComponent<Props<T>, State> {
	constructor(props: Props<T>) {
		super(props);

		this.state = {
			value: ''
		};
	}

	private _onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const value = e.target.value || '';
		this.setState({value});
	};

	render(): React.ReactNode {
		const props = this.props;
		const list = new Fuse<T>(props.options, {
			includeScore: true,
			// location: 30,
			// distance: 30,
			ignoreLocation: true,
			threshold: 0.1,
			keys: props.keys
		});
		const value = this.state.value;
		const items = list.search(value);
		const resultItems = items.map((item) => item.item);

		return (
			<>
				<div className={props.className}>
					<Input value={value} onChange={this._onChange} placeholder={props.placeholder} />
				</div>
				{props.children({value: value, items: resultItems})}
			</>
		);
	}
}

export default FuseSearch;
