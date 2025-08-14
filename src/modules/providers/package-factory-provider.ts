import { PackageFactory } from '../package-factory';
import { Environment } from '../../environment/environment';
import { sourceStrategies } from '../strategies/source';
import { projectStrategies } from '../strategies/project';
import { defaultStrategy } from '../strategies/default-strategy';

export class PackageFactoryProvider
{
	static create(): PackageFactory
	{
		const strategies = (() => {
			if (Environment.getType() === 'source')
			{
				return sourceStrategies;
			}

			return projectStrategies;
		})();

		return new PackageFactory({
			strategies,
			defaultStrategy,
		});
	}
}
