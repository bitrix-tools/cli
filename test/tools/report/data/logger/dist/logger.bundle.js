this.BX = this.BX || {};
(function (exports,main_core) {
	'use strict';

	var Logger =
	/*#__PURE__*/
	function () {
	  function Logger() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
	      name: 'Logger'
	    };
	    babelHelpers.classCallCheck(this, Logger);
	    this.name = options.name;
	  }

	  babelHelpers.createClass(Logger, [{
	    key: "setName",
	    value: function setName(name) {
	      if (main_core.Type.isString(name)) {
	        this.name = name;
	      }
	    }
	  }, {
	    key: "getName",
	    value: function getName() {
	      return this.name;
	    }
	  }]);
	  return Logger;
	}();

	exports.Logger = Logger;

}((this.BX[''] = this.BX[''] || {}),BX));
//# sourceMappingURL=logger.bundle.js.map
