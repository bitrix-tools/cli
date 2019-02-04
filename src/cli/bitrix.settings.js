import ask from '../tools/ask';
import box from '../tools/box';
import 'colors';
import bitrixAdjust from './bitrix.adjust';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export default async function bitrixSettings() {
	const answers = await ask([
		{
			name: 'Adjust Mercurial repository',
			id: 'hg',
			type: 'confirm',
			default: false
		}
	]);

	if (answers.hg) {
		const adjustAnswers = await ask([
			{
				name: 'Adjust all repositories',
				id: 'adjustType',
				type: 'list',
				choices: [
					{
						name: 'All repositories',
						value: 'all',
						default: true
					},
					{
						name: 'Specified repository',
						value: 'specified'
					}
				]
			}
		]);

		if (adjustAnswers.adjustType === 'all') {
			const hgrcPath = path.resolve(os.homedir(), '.hgrc');
			bitrixAdjust({
				silent: true,
				path: hgrcPath
			});

			console.log(box(`${hgrcPath} updated`));
		}

		if (adjustAnswers.adjustType === 'specified') {
			const repositoryAnswers = await ask([
				{
					name: 'Specify repository path',
					id: 'path',
					type: 'input',
					validate: (value) => {
						const normalizedValue = value ? value.replace('~', os.homedir()) : '';
						const repositoryPath = path.resolve(normalizedValue);

						if (!fs.existsSync(repositoryPath))
						{
							return `Not exists path ${repositoryPath}`;
						}

						const hgPath = path.resolve(repositoryPath, '.hg');

						if (!fs.existsSync(hgPath))
						{
							return `Specified path is not valid Mercurial repository`;
						}

						return true;
					}
				}
			]);

			const normalizedPath = repositoryAnswers.path.replace('~', os.homedir());
			const repositoryPath = path.resolve(normalizedPath);
			const hgrcPath = path.resolve(repositoryPath, '.hg', '.hgrc');

			bitrixAdjust({
				silent: true,
				path: hgrcPath
			});

			console.log(box(`${hgrcPath} updated`));
		}
	}
}