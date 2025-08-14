type BasePackageOptions = {
	path: string,
};

function randomTimeout(min: number, max: number) {
	const timeout = Math.floor(Math.random() * (max - min + 1)) + min;
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(timeout); // можно вернуть время, на которое был установлен таймаут
		}, timeout);
	});
}

export abstract class BasePackage
{
	readonly #path: string;

	constructor(options: BasePackageOptions)
	{
		this.#path = options.path;
	}

	getPath(): string
	{
		return this.#path;
	}

	async build(): Promise<any>
	{
		await randomTimeout(10, 200);
		return Promise.resolve();
	}

	abstract getName(): string
	abstract getModuleName(): string
}
