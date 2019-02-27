import slash from 'slash';

export default function buildTemplatePath(filePath) {
	return `/bitrix/templates/${`${slash(filePath)}`.split('install/templates/')[1]}`;
};