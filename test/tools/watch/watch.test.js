import assert from 'assert';
import watch from '../../../src/tools/watch';
import * as path from 'path';
import * as fs from 'fs';

const modules = path.resolve(__dirname, 'data/modules');

const extensions = [
	path.resolve(modules, 'main/install/js/main/extension'),
	path.resolve(modules, 'main/install/js/main/extension/child1'),
	path.resolve(modules, 'main/install/js/main/extension/child2'),
	path.resolve(modules, 'main/install/components/bitrix/test/templates/.default'),
	path.resolve(modules, 'ui/install/js/ui/extension')
];

describe('tools/watch', () => {
	it('Should be exported as function', () => {
		assert(typeof watch === 'function');
	});

	it('Should emit event "change" if input file changed', async () => {
		const extensionPath = extensions[0];
		const extensionInputPath = path.resolve(extensionPath, 'src/app.js');
		const emitter = watch(extensionPath);

		await new Promise(resolve => {
			emitter
				.on('start', (watcher) => {
					watcher.emit('change', extensionInputPath);
					watcher.close();
					resolve();
				})
				.on('change', (config) => {
					assert(checkConfig(extensionPath, config));
				});
		});
	});

	it('Should does not emit event "change" if output file changed', async () => {
		const extensionPath = extensions[0];
		const extensionOutputPath = path.resolve(extensionPath, 'dist/app.bundle.js');
		const emitter = watch(extensionPath);

		await new Promise(resolve => {
			emitter
				.on('start', (watcher) => {
					watcher.emit('change', extensionOutputPath);
					watcher.close();
					resolve();
				})
				.on('change', () => {
					assert(false);
				});
		});
	});

	it('Should does not emit event "change" if map file changed', async () => {
		const extensionPath = extensions[0];
		const extensionOutputMapPath = path.resolve(extensionPath, 'dist/app.bundle.js.map');
		const emitter = watch(extensionPath);

		await new Promise(resolve => {
			emitter
				.on('start', (watcher) => {
					watcher.emit('change', extensionOutputMapPath);
					watcher.close();
					resolve();
				})
				.on('change', () => {
					assert(false);
				});
		});
	});
});

function checkConfig(context, config, assertion = false) {
	const input = path.resolve(context, 'src/app.js');
	const output = path.resolve(context, 'dist/app.bundle.js');

	if (config.input !== input) {
		assertion && assert(false, `Invalid input ${path.basename(input)}`);
		return false;
	}

	if (config.output.js !== output) {
		assertion && assert(false, `Invalid output ${path.basename(output.js)}`);
		return false;
	}

	return true;
}