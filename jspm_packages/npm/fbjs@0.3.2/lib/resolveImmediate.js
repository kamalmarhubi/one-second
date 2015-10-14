/* */ 
'use strict';
var Promise = require("./Promise");
var resolvedPromise = Promise.resolve();
function resolveImmediate(callback) {
  resolvedPromise.then(callback)['catch'](throwNext);
}
function throwNext(error) {
  setTimeout(function() {
    throw error;
  }, 0);
}
module.exports = resolveImmediate;
