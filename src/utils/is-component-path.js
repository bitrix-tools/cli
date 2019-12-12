// @flow
import parseComponentTemplatePath from '../path/parse-component-template-path';

export default function isComponentPath(filePath: string): boolean {
	const parsed = parseComponentTemplatePath(filePath);
	return !!parsed;
}
