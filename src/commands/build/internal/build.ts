import { verboseBuild } from './verbose.build';
import { plainBuild } from './plain.build';
import { BasePackage } from '../../../modules/packages/base-package';

export function build(extension: BasePackage, args: Record<string, any>): () => Promise<any>
{
	return () => {
		if (args.verbose)
		{
			return verboseBuild(extension, args);
		}

		return plainBuild(extension, args);
	};
}
