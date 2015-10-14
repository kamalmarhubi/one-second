/* */ 
(function(process) {
  'use strict';
  var invariant = require("./invariant");
  var keyMirror = function(obj) {
    var ret = {};
    var key;
    !(obj instanceof Object && !Array.isArray(obj)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'keyMirror(...): Argument must be an object.') : invariant(false) : undefined;
    for (key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }
      ret[key] = key;
    }
    return ret;
  };
  module.exports = keyMirror;
})(require("process"));
