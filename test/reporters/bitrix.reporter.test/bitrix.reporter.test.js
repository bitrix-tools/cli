import assert from 'assert';
import * as sinon from 'sinon';
import * as path from 'path';
import 'colors';
import logSymbols from 'log-symbols';
import bitrixReporter from '../../../src/reporters/bitrix.reporter';

describe('reporters/bitrix.reporter', () => {
	beforeEach(function() {
		sinon.spy(console, 'log');
	});

	afterEach(function() {
		console.log.restore();
		delete global.currentDirectory;
		delete global.testsStatus;
	});

	it('Should be exported as function', () => {
		assert(typeof bitrixReporter === 'function');
	});

	it('Should print correct reports', () => {
		const dataDir = path.resolve(__dirname, 'data');
		const installDir = path.resolve(dataDir, 'modules/main/install');

		const samples = [
			{
				source: {
					context: path.resolve(installDir, 'js/main/extension'),
					bundle: {
						bundle: path.resolve(installDir, 'js/main/extension/dist/app.bundle.js')
					}
				},
				result: ` ${logSymbols.success} Build extension main.extension`
			},
			{
				source: {
					context: path.resolve(installDir, 'components/bitrix/main.ui.filter/templates/.default'),
					bundle: {
						bundle: path.resolve(installDir, 'components/bitrix/main.ui.filter/templates/.default/script.js')
					}
				},
				result: ` ${logSymbols.success} Build component bitrix:main.ui.filter`
			},
			{
				source: {
					context: path.resolve(installDir, 'templates/.default'),
					bundle: {
						bundle: path.resolve(installDir, 'templates/.default/script.js')
					}
				},
				result: ` ${logSymbols.success} Build template .default`
			},
			{
				source: {
					context: '/test/path',
					bundle: {
						bundle: '/test/path/script.js'
					}
				},
				result: ` ${logSymbols.success} Build bundle /test/path/script.js`
			}
		];

		samples.forEach(entry => {
			global.currentDirectory = entry.source.context;
			bitrixReporter(entry.source.bundle);
			assert(console.log.lastCall.args[0].includes(entry.result));
		});
	});

	it('Should print correct reports with test status', () => {
		const dataDir = path.resolve(__dirname, 'data');
		const installDir = path.resolve(dataDir, 'modules/main/install');

		const samples = [
			{
				source: {
					status: 'passed',
					context: path.resolve(installDir, 'js/main/extension'),
					bundle: {
						bundle: path.resolve(installDir, 'js/main/extension/dist/app.bundle.js')
					}
				},
				result: 'tests passed'.green
			},
			{
				source: {
					status: 'failure',
					context: path.resolve(installDir, 'js/main/extension'),
					bundle: {
						bundle: path.resolve(installDir, 'js/main/extension/dist/app.bundle.js')
					}
				},
				result: 'tests failed'.red
			},
			{
				source: {
					status: 'notests',
					context: path.resolve(installDir, 'js/main/extension'),
					bundle: {
						bundle: path.resolve(installDir, 'js/main/extension/dist/app.bundle.js')
					}
				},
				result: 'no tests'.grey
			}
		];

		samples.forEach(entry => {
			global.currentDirectory = entry.source.context;
			global.testsStatus = global.testsStatus || {};
			global.testsStatus[entry.source.context] = entry.source.status;
			bitrixReporter(entry.source.bundle, {test: true});
			assert(console.log.lastCall.args[0].includes(entry.result));

			global.currentDirectory = entry.source.context;
			delete global.testsStatus;
			bitrixReporter(entry.source.bundle, {test: true});
			assert(console.log.lastCall.args[0].includes(entry.result) === false);
		});
	});

	it('Should print correct reports with argv.path', () => {
		const dataDir = path.resolve(__dirname, 'data');
		const installDir = path.resolve(dataDir, 'modules/main/install');

		const samples = [
			{
				source: {
					context: path.resolve(installDir, 'js/main/extension'),
					bundle: {
						bundle: path.resolve(installDir, 'js/main/extension/dist/app.bundle.js')
					}
				},
				result: ` ${logSymbols.success} Build extension main.extension`
			},
			{
				source: {
					context: path.resolve(installDir, 'components/bitrix/main.ui.filter/templates/.default'),
					bundle: {
						bundle: path.resolve(installDir, 'components/bitrix/main.ui.filter/templates/.default/script.js')
					}
				},
				result: ` ${logSymbols.success} Build component bitrix:main.ui.filter`
			},
			{
				source: {
					context: path.resolve(installDir, 'templates/.default'),
					bundle: {
						bundle: path.resolve(installDir, 'templates/.default/script.js')
					}
				},
				result: ` ${logSymbols.success} Build template .default`
			},
			{
				source: {
					context: '/test/path',
					bundle: {
						bundle: '/test/path/script.js'
					}
				},
				result: ` ${logSymbols.success} Build bundle /test/path/script.js`
			}
		];

		samples.forEach(entry => {
			bitrixReporter(entry.source.bundle, {path: entry.source.context});
			assert(console.log.lastCall.args[0].includes(entry.result));
		});

		// test with alias
		samples.forEach(entry => {
			bitrixReporter(entry.source.bundle, {p: entry.source.context});
			assert(console.log.lastCall.args[0].includes(entry.result));
		});
	});

	it('Should print correct reports with argv.p', () => {
		const dataDir = path.resolve(__dirname, 'data');
		const installDir = path.resolve(dataDir, 'modules/main/install');

		const samples = [
			{
				source: {
					context: path.resolve(installDir, 'js/main/extension'),
					bundle: {
						bundle: path.resolve(installDir, 'js/main/extension/dist/app.bundle.js')
					}
				},
				result: ` ${logSymbols.success} Build extension main.extension`
			},
			{
				source: {
					context: path.resolve(installDir, 'components/bitrix/main.ui.filter/templates/.default'),
					bundle: {
						bundle: path.resolve(installDir, 'components/bitrix/main.ui.filter/templates/.default/script.js')
					}
				},
				result: ` ${logSymbols.success} Build component bitrix:main.ui.filter`
			},
			{
				source: {
					context: path.resolve(installDir, 'templates/.default'),
					bundle: {
						bundle: path.resolve(installDir, 'templates/.default/script.js')
					}
				},
				result: ` ${logSymbols.success} Build template .default`
			},
			{
				source: {
					context: '/test/path',
					bundle: {
						bundle: '/test/path/script.js'
					}
				},
				result: ` ${logSymbols.success} Build bundle /test/path/script.js`
			}
		];

		samples.forEach(entry => {
			bitrixReporter(entry.source.bundle, {p: entry.source.context});
			assert(console.log.lastCall.args[0].includes(entry.result));
		});
	});

	it('Should print correct reports with cwd', () => {
		const dataDir = path.resolve(__dirname, 'data');
		const installDir = path.resolve(dataDir, 'modules/main/install');

		const samples = [
			{
				source: {
					context: path.resolve(installDir, 'js/main/extension'),
					bundle: {
						bundle: path.resolve(installDir, 'js/main/extension/dist/app.bundle.js')
					}
				},
				result: ` ${logSymbols.success} Build extension main.extension`
			},
			{
				source: {
					context: path.resolve(installDir, 'components/bitrix/main.ui.filter/templates/.default'),
					bundle: {
						bundle: path.resolve(installDir, 'components/bitrix/main.ui.filter/templates/.default/script.js')
					}
				},
				result: ` ${logSymbols.success} Build component bitrix:main.ui.filter`
			},
			{
				source: {
					context: path.resolve(installDir, 'templates/.default'),
					bundle: {
						bundle: path.resolve(installDir, 'templates/.default/script.js')
					}
				},
				result: ` ${logSymbols.success} Build template .default`
			},
			{
				source: {
					context: '/test/path',
					bundle: {
						bundle: '/test/path/script.js'
					}
				},
				result: ` ${logSymbols.success} Build bundle /test/path/script.js`
			}
		];

		samples.forEach(entry => {
			bitrixReporter(entry.source.bundle);
			assert(console.log.lastCall.args[0].includes(entry.result));
		});
	});
});