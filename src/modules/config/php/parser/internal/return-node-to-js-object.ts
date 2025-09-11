export function returnNodeToJsObject(node: any): any
{
	if (!node)
	{
		return undefined;
	}

	switch (node.kind)
	{
		case 'string':
			return node.value;

		case 'number':
			return parseFloat(node.value);

		case 'boolean':
			return node.value === true || node.value === 'true';

		case 'null':
			return null;

		case 'variable':
			const varName = node.name || 'unknown';
			return { $var: '$' + varName };

		case 'array':
		case 'short_array':
			const result: any = {};
			const items = node.items || [];
			const isAssoc = items.some((item: any) => item.key != null);

			if (!isAssoc)
			{
				return items.map((item: any) => returnNodeToJsObject(item.value));
			}

			for (const item of items)
			{
				const key = item.key ? returnNodeToJsObject(item.key) : Object.keys(result).length;
				result[key] = returnNodeToJsObject(item.value);
			}
			return result;

		case 'call':
			const what = returnNodeToJsObject(node.what);
			const args = (node.arguments || []).map(returnNodeToJsObject);

			if (what.$property || what.$static || what.$index || what.$chain || what.$staticCallResult)
			{
				const chain = what.$chain
					? [...what.$chain]
					: what.$property
						? [what.$property, what.property]
						: what.$static
							? [what.$static, what.property]
							: what.$index
								? [what.$index]
								: [what];

				return {
					$chain: [...chain, { $call: node.what.name || 'call', args }],
				};
			}

			return {
				$fn: returnNodeToJsObject(node.what),
				args,
			};

		case 'propertylookup':
			const object = returnNodeToJsObject(node.what);
			const property = node.offset.name || returnNodeToJsObject(node.offset);

			const propResult = {
				$property: object,
				property: property
			};

			if (node.next)
			{
				const next = returnNodeToJsObject(node.next);
				return {
					$chain: [object, { $property: property }],
					andThen: next
				};
			}

			return propResult;

		case 'arraylookup':
			const array = returnNodeToJsObject(node.what);
			const index = returnNodeToJsObject(node.offset);

			const indexResult = {
				$index: array,
				index: index
			};

			if (node.next)
			{
				return {
					$chain: [indexResult],
					andThen: returnNodeToJsObject(node.next)
				};
			}

			return indexResult;

		case 'staticlookup':
			const className = returnNodeToJsObject(node.class);
			const offset = node.offset.name || returnNodeToJsObject(node.offset);

			if (node.next?.kind === 'call')
			{
				return {
					$staticCall: className,
					method: offset,
					args: node.next.arguments.map(returnNodeToJsObject)
				};
			}

			return {
				$static: className,
				property: offset
			};

		case 'namedargument':
			return {
				$named: node.name,
				value: returnNodeToJsObject(node.value)
			};

		case 'retif':
			return {
				$coalesce: returnNodeToJsObject(node.cond),
				default: returnNodeToJsObject(node.else)
			};

		case 'expr':
		case 'encaps':
			return returnNodeToJsObject(node.expr);

		case 'identifier':
			return node.name;

		default:
			return {
				$unknown: node.kind,
				raw: node,
			};
	}
}
