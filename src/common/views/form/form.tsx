import * as React from 'react';

interface Props {
	onSubmit?: () => void;
	disabled?: boolean;
}

const formContext = React.createContext(false);

class Form extends React.Component<Props> {
	private _onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		this.props.onSubmit?.();
	};

	render() {
		const props = this.props;
		return (
			<form onSubmit={this._onSubmit}>
				<formContext.Provider value={Boolean(props.disabled)}>{props.children}</formContext.Provider>
			</form>
		);
	}
}

export default Form;
export {formContext};
