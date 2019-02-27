import inquirer from 'inquirer';

export default async function ask(questions = []) {
	const answers = {};

	if (!Array.isArray(questions) || !questions.length) {
		return answers;
	}

	const rawAnswers = await inquirer.prompt(questions);

	return Object.keys(rawAnswers).reduce((acc, item) => {
		const question = questions.find((currentQuestion) => {
			return currentQuestion.name === item;
		});

		answers[question.id || item] = rawAnswers[item];
		return answers;
	}, answers);
}