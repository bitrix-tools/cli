import 'colors';
import path from 'path';
import os from 'os';
import fs from 'fs';
import logSymbols from 'log-symbols';
import Logger from '@bitrix/logger';
import bitrixAdjust from './bitrix.adjust';
import box from '../tools/box';
import ask from '../tools/ask';
import argv from '../process/argv';

export default async function bitrixSettings() {
	if (argv.intro) {
		// eslint-disable-next-line
		Logger.log(box(`
			${logSymbols.success} @bitrix/cli installed 
			Answer a few questions
		`));
	}

	const answers = await ask([
		{
			name: 'Adjust Mercurial repository',
			id: 'hg',
			type: 'confirm',
			default: false,
		},
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
						default: true,
					},
					{
						name: 'Specified repository',
						value: 'specified',
					},
				],
			},
		]);

		if (adjustAnswers.adjustType === 'all') {
			const hgrcPath = path.resolve(os.homedir(), '.hgrc');
			bitrixAdjust({
				silent: true,
				path: hgrcPath,
			});

			// eslint-disable-next-line
			Logger.log(box(`${hgrcPath} updated`));
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
							return 'Specified path is not valid Mercurial repository';
						}

						return true;
					},
				},
			]);

			const normalizedPath = repositoryAnswers.path.replace('~', os.homedir());
			const repositoryPath = path.resolve(normalizedPath);
			const hgrcPath = path.resolve(repositoryPath, '.hg', '.hgrc');

			bitrixAdjust({
				silent: true,
				path: hgrcPath,
			});

			// eslint-disable-next-line
			Logger.log(box(`${hgrcPath} updated`));
		}
	}
}