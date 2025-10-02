export type DependencyNode = {
	name: string;
	visited?: boolean;
	children?: Array<DependencyNode>;
	bundlesSize?: { css: number, js: number },
};
