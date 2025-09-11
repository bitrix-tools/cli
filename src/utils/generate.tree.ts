export function generateTreeString(tree: Record<string, any>, prefix = ''): string {
	const lines: string[] = [];
	const keys = Object.keys(tree);

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const isLast = i === keys.length - 1;
		const connector = isLast ? '└─ ' : '├─ ';
		const nextPrefix = prefix + (isLast ? '   ' : '│  ');

		// Добавляем текущую строку
		lines.push(prefix + connector + key);

		// Рекурсивно обрабатываем детей
		const children = tree[key];
		if (children && typeof children === 'object' && !Array.isArray(children)) {
			const childTree = generateTreeString(children, nextPrefix);
			// Разбиваем на строки и добавляем по одной
			const childLines = childTree.split('\n').filter(line => line.trim() !== '');
			lines.push(...childLines);
		}
	}

	// Убираем возможные пустые строки и лишние переносы
	return lines.filter(line => line.trim() !== '').join('\n');
}
