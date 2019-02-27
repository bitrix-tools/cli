import createExtension from '../tools/create/extension';
import params from '../process/params';
import argv from '../process/argv';
import ask from '../tools/ask';
import box from '../tools/box';
import 'colors';

export default async function bitrixCreate() {
	const answers = await ask([
		{
			name: 'Extension name',
			id: 'name',
			type: 'input',
			default: typeof argv._[1] === 'string' ? argv._[1] : '',
			validate: (input) => {
				if (typeof input === 'string' && input.length) {
					return true;
				}
				return 'Name should be not empty string';
			},
		},
		{
			name: 'Enable tests',
			id: 'tests',
			type: 'confirm',
			default: true,
		},
		{
			name: 'Enable Flow',
			id: 'flow',
			type: 'confirm',
			default: false,
		},
	]);

	const extInfo = createExtension(params.path, answers);
	const info = box(`
		${'Success!'.bold}
		Extension ${extInfo.extensionName} created
		
		Run ${`bitrix build -p ./${answers.name}`.bold} for build extension
		
		${'Include extension in php'.bold}
		\\Bitrix\\Main\\Extension::load('${extInfo.extensionName}');
		
		${'or import in your js code'.bold}
		import {${extInfo.functionName}} from '${extInfo.extensionName}';
	`);

	// eslint-disable-next-line
	return console.log(info);
}