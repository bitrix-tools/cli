import { findRootByIndicator } from './find-root-by-indicators';

const MODULE_REPO_INDICATORS = ['main', 'ui', 'crm'];
const BITRIX_ROOT_INDICATORS = ['bitrix', 'index.php'];

type Context = {
	type: 'project' | 'source' | 'unknown',
	root: string | null,
};

export function getContext(cwd: string): Context
{
	const bitrixRoot = findRootByIndicator(cwd, BITRIX_ROOT_INDICATORS);
	if (bitrixRoot)
	{
		return {
			type: 'project',
			root: bitrixRoot,
		};
	}

	const moduleRepoRoot = findRootByIndicator(cwd, MODULE_REPO_INDICATORS);
	if (moduleRepoRoot)
	{
		return {
			type: 'source',
			root: moduleRepoRoot,
		};
	}

	return {
		type: 'unknown',
		root: null,
	};
}
