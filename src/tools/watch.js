import Directory from '../entities/directory';
import slash from 'slash';
import path from 'path';
import EventEmitter from 'events';
import chokidar from 'chokidar';
import repository from '../process/repository';
import isAllowed from '../utils/is-allowed';
import isInput from '../utils/is-input';

export default function watch(directories) {
	directories = Array.isArray(directories) ? directories : [directories];
	const pattern = createPattern(directories);
	const emitter = new EventEmitter();

	process.nextTick(() => {
		emitter.emit('start', watcher);
	});

	const watcher = chokidar.watch(pattern)
		.on('ready', () => emitter.emit('ready', watcher))
		.on('change', (file) => {
			if (repository.isLocked(file)) {
				return;
			}

			if (!isAllowedChanges(directories, file)) {
				return;
			}

			let changedConfig = directories
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

	return emitter;
}

function isAllowedChanges(directories, file) {
	return directories
		.every(dir => isAllowed(file) && isInput(dir, file));
}

function createPattern(directories) {
	return directories.reduce((acc, dir) => {
		let directory = new Directory(dir);
		let directoryConfigs = directory.getConfigs();

		directoryConfigs.forEach(currentConfig => {
			acc.push(slash(path.resolve(currentConfig.context, '**/*.js')));
			acc.push(slash(path.resolve(currentConfig.context, '**/*.css')));
			acc.push(slash(path.resolve(currentConfig.context, '**/*.scss')));
		});

		return acc;
	}, []);
}