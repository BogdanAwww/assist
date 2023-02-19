import * as React from 'react';

type ComponentWrapper<InjectedProps> = <
	ExtendedProps extends InjectedProps,
	OriginalProps = Omit<ExtendedProps, keyof InjectedProps>
>(
	Component: React.ComponentType<ExtendedProps>
) => React.ComponentClass<OriginalProps>;

function contextConnect<InjectedProps, ContextParams>(
	context: React.Context<ContextParams>,
	transformFn?: (context: ContextParams) => InjectedProps
): ComponentWrapper<InjectedProps> {
	return function <ExtendedProps extends InjectedProps, OriginalProps = Omit<ExtendedProps, keyof InjectedProps>>(
		Component: React.ComponentType<ExtendedProps>
	): React.ComponentClass<OriginalProps> {
		return class extends React.Component<OriginalProps> {
			static displayName = `${context.displayName || 'unknownContext'}(${Component.displayName})`;
			render(): React.ReactNode {
				return (
					<context.Consumer>
						{(contextProps) => {
							const injectedProps = transformFn ? transformFn(contextProps) : contextProps;
							const extendedProps = {...this.props, ...injectedProps} as unknown as ExtendedProps;
							return <Component {...extendedProps} />;
						}}
					</context.Consumer>
				);
			}
		};
	};
}

type CreateContextConnectResult<Props, ContextParams> = {
	connect: ComponentWrapper<Props>;
	Context: React.Context<ContextParams>;
	Provider: React.Provider<ContextParams>;
};

function createContextConnect<Props, ContextParams = Props>(
	displayName: string,
	initialValue: ContextParams,
	transformFn?: (context: ContextParams) => Props
): CreateContextConnectResult<Props, ContextParams> {
	const Context = React.createContext<ContextParams>(initialValue);
	Context.displayName = displayName + 'Context';

	return {
		connect: contextConnect<Props, ContextParams>(Context, transformFn),
		Context,
		Provider: Context.Provider
	};
}

export default createContextConnect;
