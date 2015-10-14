/* */ 
(function(process) {
  'use strict';
  var emptyFunction = require("./emptyFunction");
  var warning = emptyFunction;
  if (process.env.NODE_ENV !== 'production') {
    warning = function(condition, format) {
      for (var _len = arguments.length,
          args = Array(_len > 2 ? _len - 2 : 0),
          _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }
      if (format === undefined) {
        throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
      }
      if (format.indexOf('Failed Composite propType: ') === 0) {
        return;
      }
      if (!condition) {
        var argIndex = 0;
        var message = 'Warning: ' + format.replace(/%s/g, function() {
          return args[argIndex++];
        });
        if (typeof console !== 'undefined') {
          console.error(message);
        }
        try {
          throw new Error(message);
        } catch (x) {}
      }
    };
  }
  module.exports = warning;
})(require("process"));
