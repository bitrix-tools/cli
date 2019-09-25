import getConfigs from '../../../src/utils/get-configs';
import assert from 'assert';
import path from 'path';

const installDir = path.resolve(__dirname, 'data/modules/main/install');

describe('utils/get-configs', () => {
	it('Should be exported as function', () => {
		assert(typeof getConfigs === 'function');
	});

	describe('Extensions', () => {
		it('Should return 1 config from extension directory with single entry bundle.config.js', () => {
			const extPath = path.resolve(installDir, 'js/main/myext');
			const configs = getConfigs(extPath);

			assert(configs.length === 1);
		});

		it('Should return 2 configs from extension directory with multiple entries config', () => {
			const extPath = path.resolve(installDir, 'js/main/mymultipleext');
			const configs = getConfigs(extPath);

			assert(configs.length === 2);
		});

		it('Should return 3 configs from module js directory', () => {
			const extPath = path.resolve(installDir, 'js/main');
			const configs = getConfigs(extPath);

			assert(configs.length === 3);
		});

		it('Should return 5 configs from module directory', () => {
			const extPath = path.resolve(__dirname, 'data/modules/main');
			const configs = getConfigs(extPath);

			assert(configs.length === 5);
		});

		it('Should return correct config for extension with bundle.config.js', () => {
			const extPath = path.resolve(installDir, 'js/main/myext');
			const configs = getConfigs(extPath);
			const config = configs[0];

			let inputPath = path.resolve(extPath, './src/app.js');
			let outputJsPath = path.resolve(extPath, './dist/app.bundle.js');
			let outputCssPath = path.resolve(extPath, './dist/app.bundle.css');

			assert.ok(config.context === extPath, 'invalid context');
			assert.ok(config.input === inputPath, 'invalid input path');
			assert.ok(config.output.js === outputJsPath, 'invalid output.js path');
			assert.ok(config.output.css === outputCssPath, 'invalid output.css path');
			assert.ok(config.name === 'BX.Main.MyExt', 'invalid name');
			assert.ok(config.treeshake === true, 'invalid treeshake');
		});
	});

	describe('Components', () => {
		it('Should return config for component with script.es6.js', () => {
			const extPath = path.resolve(installDir, 'components/bitrix/main.component/templates/.default');
			const configs = getConfigs(extPath);

			assert(configs.length === 1);
		});

		it('Should return config for component with bundle.config.js', () => {
			const extPath = path.resolve(installDir, 'components/bitrix/main.component/templates/custom-template');
			const configs = getConfigs(extPath);

			assert(configs.length === 1);
		});

		it('Should return correct config for component with script.es6.js', () => {
			const extPath = path.resolve(installDir, 'components/bitrix/main.component/templates/.default');
			const configs = getConfigs(extPath);
			const config = configs[0];

			let inputPath = path.resolve(extPath, './script.es6.js');
			let outputJsPath = path.resolve(extPath, './script.js');
			let outputCssPath = path.resolve(extPath, './style.css');

			assert(config.context === extPath);
			assert(config.input === inputPath);
			assert(config.output.js === outputJsPath);
			assert(config.output.css === outputCssPath);
			assert(config.name === '');
			assert(config.treeshake === true);
		});

		it('Should return correct config for component with bundle.config.js', () => {
			const extPath = path.resolve(installDir, 'components/bitrix/main.component/templates/custom-template');
			const configs = getConfigs(extPath);
			const config = configs[0];

			let inputPath = path.resolve(extPath, './src/app.js');
			let outputJsPath = path.resolve(extPath, './script.js');
			let outputCssPath = path.resolve(extPath, './script.css');

			assert(config.context === extPath);
			assert(config.input === inputPath);
			assert(config.output.js === outputJsPath);
			assert(config.output.css === outputCssPath);
			assert(config.name === 'BX.Main.Component.Custom');
			assert(config.treeshake === true);
		});
	});

	describe('Module', () => {
		it('Should return all configs from modules directory', () => {
			const extPath = path.resolve(__dirname, 'data/modules');
			const configs = getConfigs(extPath);

			assert(configs.length === 8);
		});

		it('Should return all configs from module directory (windows like path)', () => {
			const extPath = path.resolve(__dirname, 'data/modules');
			const configs = getConfigs(extPath.replace('/\//', '\\'));

			assert(configs.length === 8);
		});
	});
});