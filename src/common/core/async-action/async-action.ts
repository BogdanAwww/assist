interface AsyncAction {
	cancel: () => void;
}

interface AlwaysFunction<T, E> {
	(err: null, res: T): void;
	(err: E): void;
}

interface AsyncCallbacks<T, E = unknown> {
	success?: (res: T) => void;
	fail?: (err: E) => void;
	always?: AlwaysFunction<T, E>;
}

const asyncAction = {
	create: <T, E = unknown>(promise: PromiseLike<T>, {success, fail, always}: AsyncCallbacks<T, E>): AsyncAction => {
		let isCanceled = false;

		promise.then(
			(res) => {
				if (!isCanceled) {
					if (success) {
						success(res);
					}
					if (always) {
						always(null, res);
					}
				}
			},
			(err) => {
				if (!isCanceled) {
					if (fail) {
						fail(err);
					}
					if (always) {
						always(err);
					}
				}
			}
		);

		return {
			cancel: () => (isCanceled = true)
		};
	},

	cancel: (action?: AsyncAction): void => {
		if (action) {
			action.cancel();
		}
	}
};

export default asyncAction;
export {AsyncAction};
