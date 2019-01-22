import getDirectories from './get-directories';


export default function isRepositoryRoot(dirPath) {
	let dirs = getDirectories(dirPath);

	return (
		dirs.includes('main') &&
		dirs.includes('fileman') &&
		dirs.includes('iblock') &&
		dirs.includes('ui') &&
		dirs.includes('translate')
	);
}