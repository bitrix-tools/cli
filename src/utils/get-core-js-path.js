import * as path from 'path';
import fs from 'fs';

const {root} = path.parse(process.cwd());

export default function getCoreJsPath(corePath) {
	const baseCorePath = 'main/install/js/main/core';
	const alternativePath = 'bitrix/js/main/core';
	const newPath = path.resolve(corePath, baseCorePath);
	const newAlternativePath = path.resolve(corePath, alternativePath);

	if (fs.existsSync(newPath)) {
		return newPath;
	}

	if (fs.existsSync(newAlternativePath)) {
		return newAlternativePath;
	}

	if (corePath === root) {
		return '';
	}

	return getCoreJsPath(path.resolve(corePath, '../'));
}