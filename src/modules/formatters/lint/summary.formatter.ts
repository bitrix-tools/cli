import { LintResult } from '../../linter/lint.result';
import { pluralize } from '../../../utils/pluralize';

export async function summaryFormatter(result: LintResult): Promise<{ title: string, text: string; level: 'succeed' | 'warn' | 'fail'; }>
{
	if (result.hasErrors())
	{
		return {
			level: 'fail',
			title: `ESLint: Found ${pluralize(' error', result.getErrorsCount())} and ${pluralize(' warning', result.getWarningsCount())}.`,
			text: '',
		};
	}

	if (result.hasWarnings())
	{
		return {
			level: 'warn',
			title: `ESLint: Found ${pluralize(' warning', result.getWarningsCount())}.`,
			text: '',
		};
	}

	return {
		title: 'Eslint: All clean (0 errors, 0 warnings)',
		level: 'succeed',
		text: '',
	};
}
