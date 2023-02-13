import slash from 'slash';
import path from 'path';
import EventEmitter from 'events';
import chokidar from 'chokidar';
import Directory from '../entities/directory';
import repository from '../process/repository';
import isAllowed from '../utils/is-allowed';
import isInput from '../utils/is-input';
import getTrackedExtensions from '../utils/get-tracked-extensions';

function isAllowedChanges(directories, file) {
	return directories
		.every(dir => isAllowed(file) && isInput(dir, file));
}

const trackedExtensions = getTrackedExtensions();

function createPattern(directories) {
	return directories.reduce((acc, dir) => {
		const directory = new Directory(dir);
		const directoryConfigs = directory.getConfigs();

		directoryConfigs.forEach((currentConfig) => {
			trackedExtensions.forEach((extName) => {
				acc.push(slash(path.resolve(currentConfig.context, `**/*${extName}`)));
			});
		});

		return acc;
	}, []);
}

export default function watch(directories) {
	const preparedDirectories = Array.isArray(directories) ? directories : [directories];
	const pattern = createPattern(preparedDirectories);
	const emitter = new EventEmitter();

	const watcher = chokidar.watch(pattern)
		.on('ready', () => emitter.emit('ready', watcher))
		.on('change', (file) => {
			if (repository.isLocked(file)) {
				return;
			}

			if (!isAllowedChanges(preparedDirectories, file)) {
				return;
			}

			const changedConfig = preparedDirectories
				.reduce((acc, dir) => acc.concat((new Directory(dir)).getConfigs()), [])
				.filter(config => path.resolve(file).includes(config.context))
				.reduce((prevConfig, config) => {
					if (prevConfig && prevConfig.context.length > config.context.length) {
						return prevConfig;
					}
					return config;
				}, null);

			if (changedConfig) {
				emitter.emit('change', changedConfig);
			}
		});

	process.nextTick(() => {
		emitter.emit('start', watcher);
	});

	return emitter;
}