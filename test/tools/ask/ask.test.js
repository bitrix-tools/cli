import assert from 'assert';
import ask from '../../../src/tools/ask';

describe('tools/ask', () => {
	it('Should be exported as function', () => {
		assert(typeof ask === 'function');
	});

	it('Should does not rejects if not passed asks', async () => {
		await assert.doesNotReject(ask());
	});

	it('Should return empty object if not passed asks', async () => {
		const answers = await ask();

		assert(
			!!answers
			&& typeof answers === 'object'
			&& Object.keys(answers).length === 0
		);
	});

	it('Should return valid answers of questions', async () => {
		const questions = [
			{
				id: 'test',
				name: 'test test',
				type: 'input'
			}
		];

		ask.__Rewire__('inquirer', {prompt: (allQuestions) => {
			return allQuestions.reduce((acc, item) => {
				acc[item.name] = 'testAnswer';
				return acc;
			}, {});
		}});

		const answers = await ask(questions);

		assert(answers.test === 'testAnswer');
	});

	it('Should return valid answers of questions if passed questions without ids', async () => {
		const questions = [
			{
				name: 'test test',
				type: 'input'
			}
		];

		ask.__Rewire__('inquirer', {prompt: (allQuestions) => {
				return allQuestions.reduce((acc, item) => {
					acc[item.name] = 'testAnswer';
					return acc;
				}, {});
			}});

		const answers = await ask(questions);

		assert(answers['test test'] === 'testAnswer');
	});
});