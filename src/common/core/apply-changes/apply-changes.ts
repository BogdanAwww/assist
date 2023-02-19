function applyChanges<T extends object>(value: T, changes: DeepPartialObject<T>): T {
	const newValue = {...value};
	Object.entries(changes).forEach(([key, maybeChange]) => {
		const change = maybeChange as T[keyof T];
		if (!newValue.hasOwnProperty(key)) {
			newValue[key] = change;
		} else if (typeof change !== 'object' || Array.isArray(change) || change === null) {
			newValue[key] = change;
		} else {
			newValue[key] = applyChanges<object>(
				newValue[key] as unknown as object,
				change as unknown as object
			) as unknown as T[keyof T];
		}
	});
	return newValue;
}

export default applyChanges;
