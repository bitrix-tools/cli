import boxen from 'boxen';

const options = {
	padding: 1,
	margin: 1,
	align: 'left',
	borderColor: 'yellow',
	borderStyle: 'round',
};

export default function box(content) {
	return boxen(content.replace(/^\s+|\s+$|\t/g, ''), options);
}