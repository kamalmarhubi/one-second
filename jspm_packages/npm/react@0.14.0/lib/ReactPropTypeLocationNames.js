/* */ 
(function(process) {
  'use strict';
  var ReactPropTypeLocationNames = {};
  if (process.env.NODE_ENV !== 'production') {
    ReactPropTypeLocationNames = {
      prop: 'prop',
      context: 'context',
      childContext: 'child context'
    };
  }
  module.exports = ReactPropTypeLocationNames;
})(require("process"));
