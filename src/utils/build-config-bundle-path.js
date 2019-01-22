import slash from 'slash';
import isModulePath from './is-module-path';
import buildModulePath from './build-module-path';
import isComponentPath from './is-component-path';
import buildComponentPath from './build-component-path';
import isTemplatePath from './is-template-path';
import buildTemplatePath from './build-template-path';

function buildConfigBundlePath(filePath, ext) {
	filePath = slash(filePath);
	filePath = buildPath(filePath);

	if (ext === 'js') {
		return filePath.replace('.css', '.js');
	}

	if (ext === 'css') {
		return filePath.replace('.js', '.css');
	}

	return filePath;
}

function buildPath(path) {
	if (isModulePath(path)) {
		return buildModulePath(path);
	}

	if (isComponentPath(path)) {
		return buildComponentPath(path);
	}

	if (isTemplatePath(path)) {
		return buildTemplatePath(path);
	}

	return path;
}

export default buildConfigBundlePath;