import { getContext } from './utils/get-context';

type EnvContext = {
	type: 'project' | 'source' | 'unknown',
	root: string | null,
};

export class Environment
{
	static #context: EnvContext;

	static getContext(): EnvContext
	{
		if (!this.#context)
		{
			this.#context = getContext(process.cwd());
		}

		return this.#context;
	}

	static getRoot(): string | null
	{
		return this.getContext().root;
	}

	static getType(): EnvContext['type']
	{
		return this.getContext().type;
	}
}
