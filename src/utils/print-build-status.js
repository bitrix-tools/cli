import getNowTime from './get-now-time';
import Logger from '@bitrix/logger';
import logSymbols from 'log-symbols';
import path from 'path';
import 'colors';

type StatusOptions = {
	name: string,
	status: 'success' | 'error',
	context: string,
	bundleSize?: {
		js: string | null,
		css: string | null,
	},
	testsStatus?: 'passed' | 'failed' | 'no-tests',
	needNpmInstall?: boolean,
	paddingLeft?: number,
};

const defaultOptions: StatusOptions = {
	name: 'unknown',
	status: 'success',
	bundleSize: {
		js: '0 B',
		css: '0 B',
	},
	paddingLeft: 1,
};

export default function printBuildStatus(statusOptions: StatusOptions)
{
	const options: StatusOptions = { ...defaultOptions, ...statusOptions };
	const message: Array<string> = [];

	if (options.status === 'success')
	{
		message.push(logSymbols.success);
	}
	else
	{
		message.push(logSymbols.error);
	}

	const nowTime = getNowTime();
	const nowTimeFormatted = String(nowTime).grey;
	message.push(nowTimeFormatted);

	message.push(`Build ${options.name}`);

	if (options.needNpmInstall)
	{
		message.push(' -> ');
		message.push('Need install NPM dependencies before build!'.bgRed);
		message.push(`\n\n`);
		message.push('  Run command to fix it ↓ ↓ ↓ \n');

		let maxLength = 14;
		if (options.context !== process.cwd())
		{
			const relativePath = path.relative(process.cwd(), options.context);
			if (relativePath)
			{
				maxLength = `$ cd ${relativePath}`.length;
				message.push(`  $ cd ${relativePath}\n`.grey);
			}
			else
			{
				maxLength = `$ cd ${options.context}`.length;
				message.push(`  $ cd ${options.context}\n`.grey);
			}
		}
		message.push('  $ npm install\n'.grey);
		message.push(' ', '- '.repeat(maxLength / 2));
		message.push(`\n\n`);
	}
	else
	{
		if (typeof options.bundleSize === 'object')
		{
			message.push(' ->');
			if (typeof options.bundleSize.js === 'string')
			{
				message.push(` js: ${options.bundleSize.js}`.grey);
			}

			if (typeof options.bundleSize.css === 'string')
			{
				message.push(` css: ${options.bundleSize.css}`.grey);
			}
		}

		if (typeof options.testsStatus === 'string')
		{
			message.push(' ->');

			if (options.testsStatus === 'passed')
			{
				message.push(' Tests'.grey, `${`passed`.green}`);
			}

			if (options.testsStatus === 'failed')
			{
				message.push(' Tests'.grey, ` failed `.bgRed);
			}

			if (options.testsStatus === 'no-tests')
			{
				message.push(' Tests'.grey, `not found`.grey);
			}
		}
	}

	const paddingLeft: string = ' '.repeat(options.paddingLeft);
	const messageText: string = `${message.join(' ')}`;

	Logger.log(`${paddingLeft}${messageText}`);
}
