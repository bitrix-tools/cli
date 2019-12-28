(function (exports) {
	'use strict';

	var Component = function Component() {
	  babelHelpers.classCallCheck(this, Component);
	  babelHelpers.defineProperty(this, "name", 'Component');
	  babelHelpers.defineProperty(this, "circular", this);
	};

	var Component2 = function Component2() {
	  babelHelpers.classCallCheck(this, Component2);
	  this.name = 'Component2';
	  this.circular = this;
	};

	var componentInstance = new Component();
	var component2Instance = new Component2();

	exports.component2Instance = component2Instance;
	exports.componentInstance = componentInstance;

}(this.window = this.window || {}));
//# sourceMappingURL=app.bundle.js.map
