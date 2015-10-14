/* */ 
(function(process) {
  'use strict';
  var emptyObject = {};
  if (process.env.NODE_ENV !== 'production') {
    Object.freeze(emptyObject);
  }
  module.exports = emptyObject;
})(require("process"));
