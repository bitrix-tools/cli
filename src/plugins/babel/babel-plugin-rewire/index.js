const getDefinePropertySrc = require('rewire/lib/getDefinePropertySrc');
const babel = require('@babel/core');

const src = getDefinePropertySrc();

module.exports = function() {
	return {
		visitor: {
			Program: {
				enter(path) {
					path.pushContainer('body', babel.parse(src).program.body);
				},
			},
		},
	};
};