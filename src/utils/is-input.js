import path from 'path';
import Directory from '../entities/directory';

export default function isInput(dir, fileName) {
	return (new Directory(dir)).getConfigs().every((config) => {
		return !fileName.includes(path.normalize(config.output.js))
			&& !fileName.includes(path.normalize(config.output.css));
	});
};