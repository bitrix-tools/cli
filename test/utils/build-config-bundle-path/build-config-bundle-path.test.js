import assert from 'assert';
import buildConfigBundlePath from '../../../src/utils/build-config-bundle-path';

describe('utils/build-config-bundle-path', () => {
	it('Should be exported as function', () => {
		assert(typeof buildConfigBundlePath === 'function');
	});

	it('Should return valid bundle path if passed valid source path', () => {
		const samples = [
			{
				source: '/modules/main/install/js/main/loader/loader.bundle.js',
				result: {
					css: '/modules/main/install/js/main/loader/loader.bundle.css',
					js:  '/modules/main/install/js/main/loader/loader.bundle.js'
				}
			},
			{
				source: '/modules/test/install/js/test/loader/loader.bundle.js',
				result: {
					css: '/modules/test/install/js/test/loader/loader.bundle.css',
					js:  '/modules/test/install/js/test/loader/loader.bundle.js'
				}
			},
			{
				source: '/modules/test/install/components/bitrix/main.ui.filter' +
					'/templates/.default/component.bundle.js',
				result: {
					css: '/modules/test/install/components/bitrix/main.ui.filter' +
						'/templates/.default/component.bundle.css',
					js:  '/modules/test/install/components/bitrix/main.ui.filter' +
						'/templates/.default/component.bundle.js'
				}
			},
			{
				source: '/modules/main/install/templates/.default/template.bundle.js',
				result: {
					css: '/modules/main/install/templates/.default/template.bundle.css',
					js:  '/modules/main/install/templates/.default/template.bundle.js'
				}
			},
			{
				source: '/custom/path/custom.bundle.js',
				result: {
					css: '/custom/path/custom.bundle.css',
					js:  '/custom/path/custom.bundle.js'
				}
			}
		];

		samples.forEach(entry => {
			assert(buildConfigBundlePath(entry.source, 'css') === entry.result.css);
			assert(buildConfigBundlePath(entry.source, 'js') === entry.result.js);
		});
	});

	it('Should return valid bundle path if passed valid source path (Windows like path)', () => {
		const samples = [
			{
				source: '\\modules\\main\\install\\js\\main\\loader\\loader.bundle.js',
				result: {
					css: '/modules/main/install/js/main/loader/loader.bundle.css',
					js:  '/modules/main/install/js/main/loader/loader.bundle.js'
				}
			},
			{
				source: '\\modules\\test\\install\\js\\test\\loader\\loader.bundle.js',
				result: {
					css: '/modules/test/install/js/test/loader/loader.bundle.css',
					js:  '/modules/test/install/js/test/loader/loader.bundle.js'
				}
			},
			{
				source: '\\modules\\test\\install\\components\\bitrix\\main.ui.filter' +
					'\\templates\\.default\\component.bundle.js',
				result: {
					css: '/modules/test/install/components/bitrix/main.ui.filter' +
						'/templates/.default/component.bundle.css',
					js:  '/modules/test/install/components/bitrix/main.ui.filter' +
						'/templates/.default/component.bundle.js'
				}
			},
			{
				source: '\\modules\\main\\install\\templates\\.default\\template.bundle.js',
				result: {
					css: '/modules/main/install/templates/.default/template.bundle.css',
					js:  '/modules/main/install/templates/.default/template.bundle.js'
				}
			},
			{
				source: '\\custom\\path\\custom.bundle.js',
				result: {
					css: '/custom/path/custom.bundle.css',
					js:  '/custom/path/custom.bundle.js'
				}
			}
		];

		samples.forEach(entry => {
			assert(buildConfigBundlePath(entry.source, 'css') === entry.result.css);
			assert(buildConfigBundlePath(entry.source, 'js') === entry.result.js);
		});
	});

	it('Should return path as is if passed invalid extension', () => {
		const samples = [
			{
				source: '/modules/main/install/js/main/loader/loader.bundle.js',
				result: '/modules/main/install/js/main/loader/loader.bundle.js'
			},
			{
				source: '/modules/test/install/js/test/loader/loader.bundle.js',
				result: '/modules/test/install/js/test/loader/loader.bundle.js'
			},
			{
				source: '/modules/test/install/components/bitrix/main.ui.filter' +
					'/templates/.default/component.bundle.js',
				result: '/modules/test/install/components/bitrix/main.ui.filter' +
					'/templates/.default/component.bundle.js'
			},
			{
				source: '/modules/main/install/templates/.default/template.bundle.js',
				result: '/modules/main/install/templates/.default/template.bundle.js'
			},
			{
				source: '/custom/path/custom.bundle.js',
				result: '/custom/path/custom.bundle.js'
			}
		];

		samples.forEach(entry => {
			assert(buildConfigBundlePath(entry.source) === entry.result);
			assert(buildConfigBundlePath(entry.source, '') === entry.result);
			assert(buildConfigBundlePath(entry.source, true) === entry.result);
			assert(buildConfigBundlePath(entry.source, false) === entry.result);
			assert(buildConfigBundlePath(entry.source, null) === entry.result);
			assert(buildConfigBundlePath(entry.source, undefined) === entry.result);
			assert(buildConfigBundlePath(entry.source, 1) === entry.result);
			assert(buildConfigBundlePath(entry.source, -1) === entry.result);
			assert(buildConfigBundlePath(entry.source, 0) === entry.result);
			assert(buildConfigBundlePath(entry.source, []) === entry.result);
			assert(buildConfigBundlePath(entry.source, {}) === entry.result);
		});
	});
});