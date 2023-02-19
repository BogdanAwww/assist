declare module '*.png' {
	const url: string;
	export default url;
}

declare module '*.svg' {
	const url: string;
	export default url;
}

declare module '*.mp3' {
	const url: string;
	export default url;
}

declare module '*.graphql' {
	import {DocumentNode} from '@apollo/client';
	const data: DocumentNode;
	export default data;
}

type DeepPartial<T> = T extends object
	? {[P in keyof T]?: DeepPartial<T[P]>}
	: T extends (infer K)[]
	? DeepPartialArray<K>
	: T;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DeepPartialArray<T> extends Array<DeepPartial<T>> {}

type DeepPartialObject<T> = {
	[P in keyof T]?: DeepPartial<T[P]>;
};

declare const ENTRY: 'admin' | 'web';
declare const IS_PRODUCTION: boolean;
declare const VERSION: string;
