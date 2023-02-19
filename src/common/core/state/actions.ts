import {Action as ReduxAction, Middleware as ReduxMiddleware} from 'redux';

interface ExtendAction<T> extends ReduxAction<'EXTEND'> {
	payload: Partial<T>;
}

interface DeepExtendAction<T> extends ReduxAction<'DEEP_EXTEND'> {
	payload: DeepPartial<T>;
}

type PlainAction<T> = ExtendAction<T> | DeepExtendAction<T>;

interface ExtraArgument<Config> {
	config: Config;
}

// Generics
type RawThunkDispatch<State, A extends ReduxAction, ExtraArgument = undefined> = (
	action: A | RawThunkAction<State, A, ExtraArgument>
) => void;

type RawThunkAction<State, A extends ReduxAction, ExtraArgument = undefined> = (
	dispatch: RawThunkDispatch<State, A, ExtraArgument>,
	getState: () => State,
	extraArgument: ExtraArgument
) => void;

type RawThunkMiddleware<State = {}, A extends ReduxAction = ReduxAction, ExtraArgument = undefined> = ReduxMiddleware<
	RawThunkDispatch<State, A, ExtraArgument>,
	State
>;

// Actions types
type ThunkAction<T> = (dispatch: ThunkDispatch<T>, getState: () => T, extraArgument: ExtraArgument<any>) => void;

type Action<T> = PlainAction<T> | ThunkAction<T>;

type ThunkDispatch<T> = RawThunkDispatch<T, PlainAction<T>, ExtraArgument<any>>;

interface WithThunkDispatch<T> {
	dispatch(action: Action<T>): void;
}

export {Action, ThunkAction, ThunkDispatch, PlainAction, WithThunkDispatch, RawThunkMiddleware, RawThunkAction};
