import * as t from '@babel/types';
import * as parser from '@babel/parser';
import * as prettier from 'prettier';
import traverse, { NodePath } from '@babel/traverse';
import generate from '@babel/generator';

export async function convertFlowToTs(code: string): Promise<string>
{
	let ast;
	try
	{
		ast = parser.parse(code, {
			sourceType: 'module',
			plugins: [
				'flow',
			],
		});
	}
	catch (error)
	{
		console.error('Babel parser error:', error);
		return code;
	}

	traverse(ast, {
		// Flow comments
		Program(path) {
			path.node.body.forEach((node) => {
				if (node.leadingComments)
				{
					node.leadingComments = node.leadingComments.filter((comment) => {
						const value = comment.value.trim();
						return !(value.includes("@flow") || value.includes("$FlowIssue"));
					});
				}

				if (node.trailingComments)
				{
					node.trailingComments = node.trailingComments.filter((comment) => {
						const value = comment.value.trim();
						return !(value.includes("@flow") || value.includes("$FlowIssue"));
					});
				}

				if (node.leadingComments)
				{
					for (const comment of node.leadingComments)
					{
						comment.value = comment.value
							.replace(/\$(FlowFixMe|FlowExpectError)/g, "@ts-expect-error")
							.replace(/\$FlowIgnore/g, "@ts-ignore");
					}
				}

				if (node.trailingComments)
				{
					for (const comment of node.trailingComments)
					{
						comment.value = comment.value
							.replace(/\$(FlowFixMe|FlowExpectError)/g, "@ts-expect-error")
							.replace(/\$FlowIgnore/g, "@ts-ignore");
					}
				}
			});
		},

		// Typeof import
		ImportSpecifier({ node }) {
			if (node.importKind === 'typeof')
			{
				node.importKind = 'type';
			}
		},
		ImportDeclaration({ node }) {
			if (node.importKind === 'typeof')
			{
				node.importKind = 'type';
			}
		},

		// * type annotation
		ExistsTypeAnnotation(path) {
			path.replaceWith(t.anyTypeAnnotation());
		},

		// covariant / contravariant
		ClassProperty({ node }) {
			if (node.variance && node.variance.kind === 'plus')
			{
				node.readonly = true;
			}

			delete node.variance;
		},

		// opaque type
		OpaqueType(path: NodePath<t.OpaqueType>) {
			const id = path.node.id;
			const typeAnnotation = path.node.impltype;
			const replacement = t.typeAlias(id, null, typeAnnotation);
			path.replaceWith(replacement);
		},

		// flow generic types
		GenericTypeAnnotation(path: NodePath<any>) {
			const typeName = path.node.id.name;

			if (typeName === '$Exact')
			{
				if (path.node.typeParameters && path.node.typeParameters.params.length === 1)
				{
					path.replaceWith(path.node.typeParameters.params[0]);
				}
			}
			else if (typeName === '$Shape')
			{
				path.node.id.name = 'Partial';
			}
			else if (typeName === '$ReadOnly')
			{
				path.node.id.name = 'Readonly';
			}
			else if (typeName === '$ReadOnlyArray')
			{
				path.node.id.name = 'ReadonlyArray';
			}
		},

		// Nullable types
		NullableTypeAnnotation: {
			exit(path) {
				const { typeAnnotation } = path.node;

				path.replaceWith(
					t.unionTypeAnnotation([
						typeAnnotation,
						t.nullLiteralTypeAnnotation(),
						t.voidTypeAnnotation(),
					])
				);
			},
		},

		ArrayPattern(path)
		{
			path.node.elements.forEach((element) => {
				if (element && element.type === 'Identifier' && element.typeAnnotation)
				{
					delete element.typeAnnotation;
				}

				if (element && element.type === 'AssignmentPattern' && element.left)
				{
					const leftSide = element.left;
					if (leftSide.type === 'Identifier' && leftSide.typeAnnotation)
					{
						delete leftSide.typeAnnotation;
					}
				}
			});
		},
	});

	const result = generate(ast, {
		retainLines: true,
		compact: false,
	}, code);

	let generatedCode = result.code;

	generatedCode = generatedCode.replace(/type\n/g, 'type ');

	generatedCode = await prettier.format(
		generatedCode,
		{
			parser: 'typescript',

			useTabs: true,
			singleQuote: true,
			trailingComma: 'all',
			plugins: [
				await import('prettier-plugin-brace-style'),
			],
			braceStyle: 'allman',
			arrowParens: 'always',
			printWidth: 120,
		},
	);

	generatedCode = generatedCode.trim();

	generatedCode = generatedCode.replace(/=>\s+/g, '=> ');

	const regexVoidToUndefined = /(\w+)\s+\|\snull\s\|\svoid/g;
	generatedCode = generatedCode.replace(regexVoidToUndefined, '$1 | null | undefined');

	return generatedCode;
}
