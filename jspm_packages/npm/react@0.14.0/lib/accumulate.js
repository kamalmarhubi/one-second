/* */ 
(function(process) {
  'use strict';
  var invariant = require("fbjs/lib/invariant");
  function accumulate(current, next) {
    !(next != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'accumulate(...): Accumulated items must be not be null or undefined.') : invariant(false) : undefined;
    if (current == null) {
      return next;
    } else {
      var currentIsArray = Array.isArray(current);
      var nextIsArray = Array.isArray(next);
      if (currentIsArray) {
        return current.concat(next);
      } else {
        if (nextIsArray) {
          return [current].concat(next);
        } else {
          return [current, next];
        }
      }
    }
  }
  module.exports = accumulate;
})(require("process"));
