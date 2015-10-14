/* */ 
(function(process) {
  'use strict';
  var ReactInstanceMap = require("./ReactInstanceMap");
  var findDOMNode = require("./findDOMNode");
  var warning = require("fbjs/lib/warning");
  var didWarnKey = '_getDOMNodeDidWarn';
  var ReactBrowserComponentMixin = {getDOMNode: function() {
      process.env.NODE_ENV !== 'production' ? warning(this.constructor[didWarnKey], '%s.getDOMNode(...) is deprecated. Please use ' + 'ReactDOM.findDOMNode(instance) instead.', ReactInstanceMap.get(this).getName() || this.tagName || 'Unknown') : undefined;
      this.constructor[didWarnKey] = true;
      return findDOMNode(this);
    }};
  module.exports = ReactBrowserComponentMixin;
})(require("process"));
