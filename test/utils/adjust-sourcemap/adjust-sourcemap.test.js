import assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import adjustSourceMap from '../../../src/utils/adjust-sourcemap';

const sourceMapPath = path.resolve(__dirname, './data/test.sourcemap.js.map');
const clonedMapPath = path.resolve(__dirname, './data/clone.sourcemap.js.map');
const resultMapPath = path.resolve(__dirname, './data/result.sourcemap.js.map');
const incorrectMap = path.resolve(__dirname, './data/bad.sourcemap.js.map');

describe('utils/adjust-sourcemap', () => {
	it('Should be exported as function', () => {
		assert(typeof adjustSourceMap === 'function');
	});

	it('Should be adjust map', () => {
		let clonedMap = JSON.parse(fs.readFileSync(sourceMapPath, 'utf-8'));

		clonedMap.sources = clonedMap.sources.map(sourcePath => {
			return path.resolve(__dirname, sourcePath);
		});

		fs.writeFileSync(clonedMapPath, JSON.stringify(clonedMap));

		adjustSourceMap(clonedMapPath);

		let adjustedMap = JSON.stringify(JSON.parse(fs.readFileSync(clonedMapPath, 'utf-8')));
		let resultMap = JSON.stringify(JSON.parse(fs.readFileSync(resultMapPath, 'utf-8')));

		assert(adjustedMap === resultMap);

		fs.unlink(clonedMapPath, () => {});
	});

	it('Should work if file not exists', () => {
		assert(adjustSourceMap() === undefined);
	});

	it('Should be throw if map incorrect', () => {
		assert.throws(() => {
			adjustSourceMap(incorrectMap);
		});
	});

	it('Should not throw if map not exists', () => {
		assert.doesNotThrow(() => {
			adjustSourceMap(path.resolve(incorrectMap, 'test'));
		});
	});
});