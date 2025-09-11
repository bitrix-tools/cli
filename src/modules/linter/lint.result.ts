import { ESLint } from 'eslint';

type LintOptions = {
	results?: Array<ESLint.LintResult>,
};

export class LintResult
{
	#results: Array<ESLint.LintResult> = [];

	constructor(options: LintOptions = {})
	{
		if (Array.isArray(options.results))
		{
			this.setResults(options.results);
		}
	}

	setResults(results: Array<ESLint.LintResult>)
	{
		this.#results = results;
	}

	getResults(): Array<ESLint.LintResult>
	{
		return this.#results;
	}

	hasErrors(): boolean
	{
		return this.getErrorsCount() > 0;
	}

	getErrorsCount(): number
	{
		return this.#results.reduce((sum, r) => sum + r.errorCount, 0);
	}

	hasWarnings(): boolean
	{
		return this.getWarningsCount() > 0;
	}

	getWarningsCount(): number
	{
		return this.#results.reduce((sum, r) => sum + r.warningCount, 0);
	}
}
