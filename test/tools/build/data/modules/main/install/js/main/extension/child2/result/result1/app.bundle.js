(function () {
	'use strict';

	var Component = function Component() {
	  babelHelpers.classCallCheck(this, Component);
	  babelHelpers.defineProperty(this, "name", 'Component');
	  babelHelpers.defineProperty(this, "circular", this);
	};

	void new Component();

}());
//# sourceMappingURL=app.bundle.js.map
