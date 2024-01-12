import isModulePath from './is-module-path';
import isLocalPath from './is-local-path';
import buildExtensionName from './build-extension-name';
import isComponentPath from './is-component-path';
import buildComponentName from './build-component-name';
import isTemplatePath from './is-template-path';
import buildTemplateName from './build-template-name';

export default function buildName(config)
{
	if (isModulePath(config.input) || isLocalPath(config.input))
	{
		return buildExtensionName(config.input, config.context);
	}

	if (isComponentPath(config.input))
	{
		return buildComponentName(config.input);
	}

	if (isTemplatePath(config.input))
	{
		return buildTemplateName(config.input);
	}

	return config.output.js;
}
