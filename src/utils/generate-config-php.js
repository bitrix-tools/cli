import fs from 'fs';
import path from 'path';
import mustache from 'mustache';
import slash from 'slash';
import buildConfigBundlePath from './build-config-bundle-path';
import {appRoot} from '../constants';

export function renderRel(rel) {
	// @todo refactor this
	return `${rel.map((item, i) => `${!i ? '\n' : ''}\t\t'${item}'`).join(',\n')}${rel.length ? ',\n\t' : ''}`;
}

function generateConfigPhp(config) {
	if (!!config && typeof config !== 'object') {
		throw new Error('Invalid config');
	}

	const templatePath = path.resolve(appRoot, 'src/templates/config.php');
	const template = fs.readFileSync(templatePath, 'utf-8');
	const outputPath = path.resolve(slash(config.context), slash(config.output.js));


	const data = {
		cssPath: slash(path.relative(slash(config.context), buildConfigBundlePath(outputPath, 'css'))),
		jsPath: slash(path.relative(slash(config.context), buildConfigBundlePath(outputPath, 'js'))),
		rel: renderRel(config.rel),
	};

	return mustache.render(template, data);
}

export default generateConfigPhp;