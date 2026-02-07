import { toPascalCase } from './to.pascal.case';
import { Environment } from '../environment/environment';

export function createNamespace(extensionName: string): string
{
	const parts = extensionName.split('.').slice(0, -1);
	const baseNamespace = Environment.getType() === 'source' ? 'BX' : '';

	return parts.reduce((acc: string, part: string, index: number) => {
		const optionalDot = acc.length > 0 ? '.' : '';

		return `${acc}${optionalDot}${part.length === 2 ? part.toUpperCase() : toPascalCase(part)}`;
	}, baseNamespace);
}
