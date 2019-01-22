import * as path from 'path';
import fs from 'fs';

const root = path.parse(process.cwd()).root;

export default function getCoreJsPath(corePath) {
	let baseCorePath = 'main/install/js/main/core';
	let alternativePath = 'bitrix/js/main/core';
	let newPath = path.resolve(corePath, baseCorePath);
	let newAlternativePath = path.resolve(corePath, alternativePath);

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