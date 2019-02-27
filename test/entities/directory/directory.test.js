import assert from 'assert';
import * as path from 'path';
import Directory from "../../../src/entities/directory";

describe('entities/directory', () => {
	it('Should be exported as function', () => {
		assert(typeof Directory === 'function');
	});

	it('Should has configs static property with Map', () => {
		assert(typeof Directory.configs === 'object');
		assert(Object.prototype.toString.call(Directory.configs) === '[object Map]')
	});

	it('Should has configs static property with Map', () => {
		assert(typeof Directory.configs === 'object');
		assert(Object.prototype.toString.call(Directory.configs) === '[object Map]')
	});

	describe('entities/directory#location', () => {
		it('Should be equals constructor 1 param value', () => {
			assert((new Directory('/test')).location === '/test');
			assert((new Directory('/test/new')).location === '/test/new');
		});
	});

	describe('entities/directory#getConfig()', () => {
		it('Should be a function', () => {
			const context = path.resolve(__dirname, 'data');
			const directory = new Directory(context);

			assert(typeof directory.getConfigs === 'function');
		});

		it('Should returns all configs from location', () => {
			const context = path.resolve(__dirname, 'data');
			const directory = new Directory(context);
			const result = directory.getConfigs();

			assert(result.length === 1);
		});

		it('Should return protected config if context equal config context', () => {
			const context = path.resolve(__dirname, 'data', 'protected');
			const directory = new Directory(context);
			const result = directory.getConfigs();

			assert(result.length === 1);
			assert(result[0].protected);
		});

		it('Should return all configs from cache', () => {
			const context = path.resolve(__dirname, 'data');
			const directory = new Directory(context);

			assert(directory.getConfigs() === directory.getConfigs());
		});
	});
});