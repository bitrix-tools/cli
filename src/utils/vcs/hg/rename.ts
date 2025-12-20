import { spawnSync } from 'child_process';
import { Environment } from '../../../environment/environment';

type RenameResult = {
	status: 'ok' | 'fail',
	stderr: string,
};

export async function hgRename(oldPath: string, newPath: string): Promise<RenameResult>
{
	const cwd = Environment.getRoot();

	const hgProcess = spawnSync(
		'hg',
		['rename', oldPath, newPath],
		{
			cwd,
			stdio: 'pipe',
		},
	);

	const stderr = hgProcess.stderr.toString('utf-8');

	return {
		status: stderr.length === 0 ? 'ok' : 'fail',
		stderr,
	};
}
