type BasePackageOptions = {
	path: string,
};

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
		return Promise.resolve();
	}

	abstract getName(): string
	abstract getModuleName(): string
	abstract getBundleConfig(): any
	abstract getConfigPhp(): any
}
