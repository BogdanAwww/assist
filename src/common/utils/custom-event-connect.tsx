import * as React from 'react';
import contextConnect from '@/common/utils/context-connect';

interface EventListener {
	name: string;
	fn: Function;
}

class EventBus {
	private _listeners: EventListener[] = [];

	on(name: string, fn: Function): void {
		this._listeners.push({name, fn});
	}

	off(name: string, fn: Function): void {
		this._listeners = this._listeners.filter((listener) => listener.name !== name || listener.fn !== fn);
	}

	emit(name: string, data?: any): void {
		const listeners = this._listeners.filter((listener) => listener.name === name);
		listeners.forEach(({fn}) => {
			fn(data);
		});
	}
}

interface CustomEventProps {
	events: EventBus;
}

const {connect: customEventConnect, Provider} = contextConnect<CustomEventProps, EventBus>(
	'customEvent',
	new EventBus(),
	(events) => ({events})
);

const bus = new EventBus();

function CustomEventProvider({children}) {
	return <Provider value={bus}>{children}</Provider>;
}

export default customEventConnect;
export {CustomEventProps, CustomEventProvider};
