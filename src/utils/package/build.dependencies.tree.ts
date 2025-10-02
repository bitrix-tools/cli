import { PackageResolver } from '../../modules/packages/package.resolver';
import { BasePackage } from '../../modules/packages/base-package';
import type { DependencyNode } from '../../modules/packages/types/dependency.node';

type BuildDependenciesTreeOptions = {
	target: BasePackage,
	visited?: Set<string>,
	isRoot?: boolean,
	size?: boolean,
};

export async function buildDependenciesTree(options: BuildDependenciesTreeOptions): Promise<Array<DependencyNode>>
{
	const { target, isRoot, visited, size } = {
		visited: new Set<string>(),
		isRoot: true,
		size: false,
		...options,
	};

	const dependencies = await target.getDependencies();
	const acc: Array<DependencyNode> = [];

	if (isRoot)
	{
		for (const node of dependencies)
		{
			visited.add(node.name);
		}
	}

	for (const node of dependencies)
	{
		if (visited.has(node.name))
		{
			acc.push({
				name: node.name,
				visited: true,
				children: [],
			});

			continue;
		}

		visited.add(node.name);

		const extension = PackageResolver.resolve(node.name);
		const children: Array<DependencyNode> = await (async () => {
			if (extension)
			{
				return await buildDependenciesTree({
					...options,
					target: extension,
					isRoot: false,
					visited,
				});
			}

			return [];
		})();

		const newNode: DependencyNode = {
			name: node.name,
			visited: false,
			children,
		};

		if (size && extension)
		{
			newNode.bundlesSize = extension.getBundlesSize();
		}

		acc.push(newNode);
	}

	if (isRoot)
	{
		const rootAcc: Array<DependencyNode> = [];
		for (const node of dependencies)
		{
			const extension = PackageResolver.resolve(node.name);
			const subTree = await (async () => {
				if (extension)
				{
					return await buildDependenciesTree({
						...options,
						target: extension,
						isRoot: false,
						visited,
					});
				}

				return [];
			})();

			const filtered: Array<DependencyNode> = [];
			for (const subNode of subTree)
			{
				if (!dependencies.find((dependency) => dependency.name === subNode.name))
				{
					filtered.push(subNode);
				}
			}

			const newNode = {
				...node,
				children: filtered,
			};

			if (size && extension)
			{
				newNode.bundlesSize = extension.getBundlesSize();
			}

			rootAcc.push(newNode);
		}

		return rootAcc;
	}

	return acc;
}
