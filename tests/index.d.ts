declare module '*.ts' {
	const url: string;
	export default url;
}

interface RewiredModuleInterface {
	__get__<T = any>(name: string): T;
}

type RewiredModule<T = {[key: string]: any}> = RewiredModuleInterface & T;
