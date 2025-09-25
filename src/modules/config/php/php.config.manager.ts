import * as path from 'node:path';
import * as fs from 'node:fs';
import { ConfigManager } from '../config.manager';
import * as bundleConfigStrategies from './strategies/index'
import { ConfigStrategy } from '../config.strategy';
import { PhpConfigParser } from './parser/php.config.parser';

export function renderRel(rel: Array<string>): string
{
	return `${rel.map((item, i) => `${!i ? '\n' : ''}\t\t'${item}'`).join(',\n')}${rel.length ? ',\n\t' : ''}`;
}

export class PhpConfigManager extends ConfigManager<{ [key: string]: any }>
{
	constructor()
	{
		super();

		Object.values(bundleConfigStrategies).forEach((strategy: ConfigStrategy) => {
			this.registerStrategy(strategy.key, strategy);
		});
	}

	loadFromFile(configPath: string): any
	{
		const parser = new PhpConfigParser();
		const contents = fs.readFileSync(path.resolve(configPath), 'utf-8');
		const result = parser.parse(contents);

		Object.entries(result).forEach(([key, value]) => {
			this.set(key, value);
		});
	}

	async save(configPath: string): Promise<any>
	{
		if (!fs.existsSync(configPath))
		{
			fs.writeFileSync(configPath, '');
		}

		const dependencies = this.get('rel');
		if (!dependencies.includes('main.core') && !dependencies.includes('main.polyfill.core'))
		{
			dependencies.unshift('main.polyfill.core');
		}

		// Updates dependencies list
		const relExp = /['"]rel['"] => (\[.*?\])(,?)/s;
		let configContent = fs.readFileSync(configPath, 'utf-8');
		const result = configContent.match(relExp);

		if (Array.isArray(result) && result[1])
		{
			const rel = `[${renderRel(dependencies)}]`;
			configContent = configContent.replace(result[1], rel);

			// Adjust skip_core
			const skipCoreExp = /['"]skip_core['"] => (true|false)(,?)/;
			const skipCoreResult = configContent.match(skipCoreExp);
			const skipCoreValue = !dependencies.includes('main.core');

			if (Array.isArray(skipCoreResult) && skipCoreResult[1])
			{
				configContent = configContent
					.replace(skipCoreExp, `'skip_core' => ${skipCoreValue},`);
			}
			else
			{
				configContent = configContent.replace(
					relExp,
					`'rel' => ${rel},\n\t'skip_core' => ${skipCoreValue},`,
				);
			}

			fs.writeFileSync(configPath, configContent);
		}
	}
}
