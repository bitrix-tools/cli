// @flow
import path from 'path';
import rollupUrl from 'rollup-plugin-url';
import slash from 'slash';
import resolveToProductPath from '../../../path/resolve-to-product-path';
import getDestDir from './get-dest-dir';

interface ResolveFilesImport {
	output?: string,
	include?: Array<string>,
	exclude?: Array<string>,
}

interface RollupFilesOptions {
	resolveFilesImport: ResolveFilesImport,
	input: string,
	output: string,
	context: string,
}

export default function rollupFiles(options: RollupFilesOptions): ?{[key: string]: any} {
	const productContext = resolveToProductPath(path.join(options.context, '/'));

	if (productContext)
	{
		const destDir = getDestDir({
			destDir: options.resolveFilesImport.output,
			output: options.output,
			context: options.context,
		});

		const rollupUrlOptions = {
			fileName: '[dirname][name][extname]',
			publicPath: slash(path.join(productContext, destDir, '/')),
			destDir: slash(path.join(options.context, destDir)),
			sourceDir: slash(path.dirname(options.input)),
			include: options.resolveFilesImport.include,
			exclude: options.resolveFilesImport.exclude,
			limit: 0,
		};

		return rollupUrl(rollupUrlOptions);
	}

	return undefined;
}