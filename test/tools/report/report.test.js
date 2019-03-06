import assert from 'assert';
import sinon from 'sinon';
import * as path from 'path';
import * as fs from 'fs';
import report from '../../../src/tools/report';

const mainLoggerPath = path.resolve(
	__dirname,
	'data',
	'modules',
	'main',
	'install',
	'js',
	'main',
	'logger',
);

const mainLoggerComponentPath = path.resolve(
	__dirname,
	'data',
	'modules',
	'main',
	'install',
	'components',
	'bitrix',
	'main.logger',
	'templates',
	'.default',
);

const mainTemplatePath = path.resolve(
	__dirname,
	'data',
	'modules',
	'main',
	'install',
	'templates',
	'.default',
);

const customExtPath = path.resolve(
	__dirname,
	'data',
	'logger',
);

describe('tools/report', () => {
	it('Should be exported as function', () => {
		assert(typeof report === 'function');
	});

	it('Should print build report for extension', () => {
		const config = require(path.resolve(mainLoggerPath, 'bundle.config.js'));
		config.input = path.resolve(mainLoggerPath, config.input);
		config.output = path.resolve(mainLoggerPath, config.output);
		config.context = mainLoggerPath;
		const log = sinon.stub();

		report.__Rewire__('Logger', {log});

		report({config});

		assert(log.lastCall.args[0].includes('Build extension main.logger'));
	});

	it('Should print build report for component', () => {
		const config = {
			input: path.resolve(mainLoggerComponentPath, 'script.es6.js'),
			output: path.resolve(mainLoggerComponentPath, 'script.js'),
			context: mainLoggerComponentPath,
		};
		const log = sinon.stub();

		report.__Rewire__('Logger', {log});

		report({config});

		assert(log.lastCall.args[0].includes('Build component bitrix:main.logger'));
	});

	it('Should print build report for template', () => {
		const config = {
			input: path.resolve(mainTemplatePath, 'script.es6.js'),
			output: path.resolve(mainTemplatePath, 'script.js'),
			context: mainTemplatePath,
		};
		const log = sinon.stub();

		report.__Rewire__('Logger', {log});

		report({config});

		assert(log.lastCall.args[0].includes('Build template .default'));
	});

	it('Should print build report for custom extension', () => {
		const config = require(path.resolve(customExtPath, 'bundle.config.js'));
		config.input = path.resolve(customExtPath, config.input);
		config.output = path.resolve(customExtPath, config.output);
		config.context = customExtPath;
		const log = sinon.stub();

		report.__Rewire__('Logger', {log});

		report({config});

		assert(log.lastCall.args[0].includes(`Build bundle ${config.output}`));
	});

	it('Should print test status "tests passed"', () => {
		const config = require(path.resolve(mainLoggerPath, 'bundle.config.js'));
		config.input = path.resolve(mainLoggerPath, config.input);
		config.output = path.resolve(mainLoggerPath, config.output);
		config.context = mainLoggerPath;
		const log = sinon.stub();

		report.__Rewire__('Logger', {log});

		report({config, testResult: 'passed'});

		assert(log.lastCall.args[0].includes('Build extension main.logger'));
		assert(log.lastCall.args[0].includes('tests passed'));
	});

	it('Should print test status "tests failed"', () => {
		const config = require(path.resolve(mainLoggerPath, 'bundle.config.js'));
		config.input = path.resolve(mainLoggerPath, config.input);
		config.output = path.resolve(mainLoggerPath, config.output);
		config.context = mainLoggerPath;
		const log = sinon.stub();

		report.__Rewire__('Logger', {log});

		report({config, testResult: 'failure'});

		assert(log.lastCall.args[0].includes('Build extension main.logger'));
		assert(log.lastCall.args[0].includes('tests failed'));
	});

	it('Should print test status "no tests"', () => {
		const config = require(path.resolve(mainLoggerPath, 'bundle.config.js'));
		config.input = path.resolve(mainLoggerPath, config.input);
		config.output = path.resolve(mainLoggerPath, config.output);
		config.context = mainLoggerPath;
		const log = sinon.stub();

		report.__Rewire__('Logger', {log});

		report({config, testResult: 'notests'});

		assert(log.lastCall.args[0].includes('Build extension main.logger'));
		assert(log.lastCall.args[0].includes('no tests'));
	});

	it('Should not print test status if passed bad test result', () => {
		const config = require(path.resolve(mainLoggerPath, 'bundle.config.js'));
		config.input = path.resolve(mainLoggerPath, config.input);
		config.output = path.resolve(mainLoggerPath, config.output);
		config.context = mainLoggerPath;
		const log = sinon.stub();

		report.__Rewire__('Logger', {log});

		report({config, testResult: 'sdfsdfs'});

		assert(log.lastCall.args[0].includes('Build extension main.logger'));
	});

	it('Should print error message if passed error with code UNRESOLVED_IMPORT', () => {
		const config = require(path.resolve(mainLoggerPath, 'bundle.config.js'));
		config.input = path.resolve(mainLoggerPath, config.input);
		config.output = path.resolve(mainLoggerPath, config.output);
		config.context = mainLoggerPath;
		const log = sinon.stub();

		report.__Rewire__('Logger', {log});

		const error = {
			code: 'UNRESOLVED_IMPORT',
			message: 'testtest',
		};
		report({config, error});

		assert(log.lastCall.args[0].includes('Error: testtest'));
	});

	it('Should print error message if passed error with code PLUGIN_ERROR', () => {
		const config = require(path.resolve(mainLoggerPath, 'bundle.config.js'));
		config.input = path.resolve(mainLoggerPath, config.input);
		config.output = path.resolve(mainLoggerPath, config.output);
		config.context = mainLoggerPath;
		const log = sinon.stub();

		report.__Rewire__('Logger', {log});

		const error = {
			code: 'PLUGIN_ERROR',
			message: 'testtest1',
		};
		report({config, error});

		assert(log.lastCall.args[0].includes('Error: testtest1'));
	});

	it('Should throw if passed another error', () => {
		const config = require(path.resolve(mainLoggerPath, 'bundle.config.js'));
		config.input = path.resolve(mainLoggerPath, config.input);
		config.output = path.resolve(mainLoggerPath, config.output);
		config.context = mainLoggerPath;
		const log = sinon.stub();

		report.__Rewire__('Logger', {log});

		const error = {
			code: '24234234',
			message: 'werwer',
		};

		assert.throws(() => {
			report({config, error});
		});
	});
});