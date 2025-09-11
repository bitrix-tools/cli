import { type Return } from 'php-parser';
import { parsePhpCodeToAst } from './internal/parse-php-code-to-ast';
import { returnNodeToJsObject } from './internal/return-node-to-js-object';

export class PhpConfigParser
{
	parse(phpCode: string): Record<string, any>
	{
		const program = parsePhpCodeToAst(phpCode);

		// @ts-ignore
		const returnNode: Return = program.children.find((node: { kind: string; }) => {
			return node.kind === 'return';
		});

		if (returnNode)
		{
			return returnNodeToJsObject(returnNode.expr);
		}

		return {};
	}
}
