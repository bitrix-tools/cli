import { PackageFactoryStrategy } from '../../package-factory';
import { extensionStrategy } from './extension-strategy';
import { componentStrategy } from './component-strategy';
import { templateStrategy } from './template-strategy';

export const projectStrategies: Array<PackageFactoryStrategy> = [
	extensionStrategy,
	componentStrategy,
	templateStrategy,
];
