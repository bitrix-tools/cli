import * as path from 'node:path';
import * as fs from 'node:fs';
import { ConfigManager } from '../config.manager';
import * as bundleConfigStrategies from './strategies/index'
import { ConfigStrategy } from '../config.strategy';
import { PhpConfigParser } from './parser/php.config.parser';

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
}
