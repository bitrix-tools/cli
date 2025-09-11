import { Engine, Program } from 'php-parser';

export function parsePhpCodeToAst(phpCode: string): Program
{
	const parser = new Engine({
		parser: {
			debug: false,
			locations: false,
			extractDoc: false,
		},
		ast: {
			withPositions: false,
		},
	});

	return parser.parseEval(phpCode.replace(/<\?(php)?/, ''));
}
