import slash from 'slash';

export default function buildConfigBundlePath(filePath, ext) {
	const normalizedPath = `${slash(filePath)}`;

	if (ext === 'js') {
		return normalizedPath.replace('.css', '.js');
	}

	if (ext === 'css') {
		return normalizedPath.replace('.js', '.css');
	}

	return normalizedPath;
}