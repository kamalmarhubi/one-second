/* */ 
(function(process) {
  'use strict';
  var ReactElement = require("./ReactElement");
  var invariant = require("fbjs/lib/invariant");
  function onlyChild(children) {
    !ReactElement.isValidElement(children) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'onlyChild must be passed a children with exactly one child.') : invariant(false) : undefined;
    return children;
  }
  module.exports = onlyChild;
})(require("process"));
