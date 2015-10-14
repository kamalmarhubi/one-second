/* */ 
(function(process) {
  'use strict';
  var invariant = require("fbjs/lib/invariant");
  function accumulateInto(current, next) {
    !(next != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'accumulateInto(...): Accumulated items must not be null or undefined.') : invariant(false) : undefined;
    if (current == null) {
      return next;
    }
    var currentIsArray = Array.isArray(current);
    var nextIsArray = Array.isArray(next);
    if (currentIsArray && nextIsArray) {
      current.push.apply(current, next);
      return current;
    }
    if (currentIsArray) {
      current.push(next);
      return current;
    }
    if (nextIsArray) {
      return [current].concat(next);
    }
    return [current, next];
  }
  module.exports = accumulateInto;
})(require("process"));
