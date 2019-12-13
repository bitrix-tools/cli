// @flow
import parseSiteTemplatePath from '../path/parse-site-template-path';

export default function isTemplatePath(filePath: string): boolean {
	const parsed = parseSiteTemplatePath(filePath);
	return !!parsed;
}