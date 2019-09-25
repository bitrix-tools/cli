import assert from 'assert';
import getSourcemaps from '../../../src/utils/get-sourcemaps';

describe('utils/get-sourcemaps', () => {
	it('Should be exported as function', () => {
		assert(typeof getSourcemaps === 'function');
	});

	it('Should return correct paths to sourcemaps', () => {
		const samples = [
			{
				source: {
					output: {
						js: '/main/install/js/main/loader/dist/loader.bundle.js',
						css: '/main/install/js/main/loader/dist/loader.bundle.css',
					},
					context: '/main/install/js/main/loader'
				},
				result: {
					js: '/main/install/js/main/loader/dist/loader.bundle.js.map',
					css: '/main/install/js/main/loader/dist/loader.bundle.css.map'
				}
			},
			{
				source: {
					output: {
						js: '/test/test.bundle.js',
						css: '/test/test.bundle.css',
					},
					context: '/test'
				},
				result: {
					js: '/test/test.bundle.js.map',
					css: '/test/test.bundle.css.map'
				}
			}
		];

		samples.forEach(entry => {
			let result = getSourcemaps(entry.source);
			assert.strictEqual(result.js, entry.result.js);
			assert.strictEqual(result.css, entry.result.css);
		});
	});

	it('Should return correct paths to sourcemaps (windows like paths)', () => {
		const samples = [
			{
				source: {
					output: {
						js: '\\main\\install\\js\\main\\loader\\dist\\loader.bundle.js',
						css: '\\main\\install\\js\\main\\loader\\dist\\loader.bundle.css',
					},
					context: '\\main\\install\\js\\main\\loader'
				},
				result: {
					js: '\\main\\install\\js\\main\\loader\\dist\\loader.bundle.js.map',
					css: '\\main\\install\\js\\main\\loader\\dist\\loader.bundle.css.map'
				}
			},
			{
				source: {
					output: {
						js: '\\test\\test.bundle.js',
						css: '\\test\\test.bundle.css',
					},
					context: '\\test'
				},
				result: {
					js: '\\test\\test.bundle.js.map',
					css: '\\test\\test.bundle.css.map'
				}
			}
		];

		samples.forEach(entry => {
			let result = getSourcemaps(entry.source);
			assert(result.js === entry.result.js);
			assert(result.css === entry.result.css);
		});
	});
});