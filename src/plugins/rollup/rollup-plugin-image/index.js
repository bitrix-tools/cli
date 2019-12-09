import * as path from 'path';
import rollupUrl from '@rollup/plugin-url';
import buildModulePath from '../../../utils/build-module-path';
import isModulePath from '../../../utils/is-module-path';
import isComponentPath from '../../../utils/is-component-path';
import buildComponentPath from '../../../utils/build-component-path';
import isTemplatePath from '../../../utils/is-template-path';
import buildTemplatePath from '../../../utils/build-template-path';

export default function rollupImage({contentImages, input, output, context} = {}) {
	const {output: imagesOutput, ...restContentImages} = contentImages;
	const destDir = (() => {
		if (typeof imagesOutput === 'string')
		{
			return `${imagesOutput.replace(/(^\.\/)(\/$)/g, '')}/`;
		}

		if (isComponentPath(context))
		{
			return path.join(path.relative(context, path.dirname(output)), 'dist');
		}

		return path.relative(context, path.dirname(output));
	})();

	const modulePath = (() => {
		if (isModulePath(context))
		{
			return buildModulePath(context);
		}

		if (isComponentPath(context))
		{
			return buildComponentPath(context);
		}

		if (isTemplatePath(context))
		{
			return buildTemplatePath(context);
		}

		return context;
	})();

	const rollupUrlOptions = {
		fileName: '[dirname][name][extname]',
		...restContentImages,
		publicPath: path.join(modulePath, destDir, '/'),
		destDir,
		sourceDir: path.dirname(input),
	};

	return rollupUrl(rollupUrlOptions);
}