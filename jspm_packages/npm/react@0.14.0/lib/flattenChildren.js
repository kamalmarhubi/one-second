/* */ 
(function(process) {
  'use strict';
  var traverseAllChildren = require("./traverseAllChildren");
  var warning = require("fbjs/lib/warning");
  function flattenSingleChildIntoContext(traverseContext, child, name) {
    var result = traverseContext;
    var keyUnique = result[name] === undefined;
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(keyUnique, 'flattenChildren(...): Encountered two children with the same key, ' + '`%s`. Child keys must be unique; when two children share a key, only ' + 'the first child will be used.', name) : undefined;
    }
    if (keyUnique && child != null) {
      result[name] = child;
    }
  }
  function flattenChildren(children) {
    if (children == null) {
      return children;
    }
    var result = {};
    traverseAllChildren(children, flattenSingleChildIntoContext, result);
    return result;
  }
  module.exports = flattenChildren;
})(require("process"));
