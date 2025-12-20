export interface ConfigStrategy<T = any> {
	key: string;
	getDefault?(): T | undefined;
	prepare?(value: any): T;
	validate?(value: T): true | string;
	save?(configSourceCode: string, value: T): string;
}
