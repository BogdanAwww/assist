import * as React from 'react';
import component, {OptionsWithoutResolver} from '@loadable/component';

type DynamicImportType<P> = () => Promise<{default: React.ComponentType<P>}>;

interface State {
	isLoaded: boolean;
}

function loadable<P>(loader: DynamicImportType<P>, options?: OptionsWithoutResolver<P>): React.ComponentType<P> {
	let InnerComponent: React.ComponentType<P> | undefined;
	let isLoading = false;
	class Component extends React.Component<P, State> {
		constructor(props: P) {
			super(props);

			this.state = {
				isLoaded: Boolean(InnerComponent)
			};
		}

		componentDidMount() {
			this._loadComponent();
		}

		private async _loadComponent(): Promise<void> {
			if (!isLoading) {
				isLoading = true;
				InnerComponent = component(loader, options);
				this.setState({isLoaded: true});
			}
		}

		render(): React.ReactNode {
			const props = this.props;
			return InnerComponent ? <InnerComponent {...props} /> : null;
		}
	}

	return Component;
}

export default loadable;
