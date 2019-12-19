// @flow
import parseExtensionPath from './parse-extension-path';
import parseComponentTemplatePath from './parse-component-template-path';
import parseSiteTemplatePath from './parse-site-template-path';

export default function resolveToProductPath(sourcePath: string): ?string {
	const parsedExtensionPath = parseExtensionPath(sourcePath);
	if (parsedExtensionPath)
	{
		const {root, jsDir, extension, filePath} = parsedExtensionPath;
		return `/${root}/js/${jsDir}/${extension.join('/')}${filePath ? `/${filePath}` : ''}`;
	}

	const parsedComponentPath = parseComponentTemplatePath(sourcePath);
	if (parsedComponentPath)
	{
		const {root, namespace, component, template, filePath} = parsedComponentPath;
		return `/${root}/components/${namespace}/${component}/templates/${template}${filePath ? `/${filePath}` : ''}`;
	}

	const parsedSiteTemplatePath = parseSiteTemplatePath(sourcePath);
	if (parsedSiteTemplatePath)
	{
		const {root, template, filePath} = parsedSiteTemplatePath;
		return `/${root}/templates/${template}${filePath ? `/${filePath}` : ''}`;
	}

	return null;
}