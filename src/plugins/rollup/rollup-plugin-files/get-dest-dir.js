// @flow
import path from 'path';
import isComponentPath from '../../../utils/is-component-path';
import isTemplatePath from '../../../utils/is-template-path';

interface GetDestDirOptions {
	destDir?: ?string,
	output: string,
	context: string,
}

export default function getDestDir({destDir, output, context}: GetDestDirOptions): string {
	if (typeof destDir === 'string')
	{
		return `${destDir.replace(/(^\.\/|^\/)(\/$)/g, '')}/`;
	}

	const outputDirname = path.dirname(output);
	const preparedContext = path.join(context, '/');

	if (isComponentPath(preparedContext) || isTemplatePath(preparedContext)) {
		const relativeOutputPath = path.relative(preparedContext, outputDirname);
		return path.join(relativeOutputPath, 'dist');
	}

	return path.relative(preparedContext, outputDirname);
}