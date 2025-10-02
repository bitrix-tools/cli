import type { DependencyNode } from '../modules/packages/types/dependency.node';

export function flattenTree(tree: Array<DependencyNode>, unique: boolean = false): Array<DependencyNode>
{
	const nodes: DependencyNode[] = [];

	function walk(currentNodes: DependencyNode[])
	{
		for (const node of currentNodes)
		{
			nodes.push(node);

			if (node.children && node.children.length > 0)
			{
				walk(node.children);
			}
		}
	}

	walk(tree);

	if (unique)
	{
		const seen = new Set<string>();
		return nodes.filter(node => {
			if (seen.has(node.name))
			{
				return false;
			}
			seen.add(node.name);
			return true;
		});
	}

	return nodes;
}
