/* */ 
(function(process) {
  'use strict';
  var invariant = require("./invariant");
  function monitorCodeUse(eventName, data) {
    !(eventName && !/[^a-z0-9_]/.test(eventName)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'You must provide an eventName using only the characters [a-z0-9_]') : invariant(false) : undefined;
  }
  module.exports = monitorCodeUse;
})(require("process"));
