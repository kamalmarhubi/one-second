/* */ 
'use strict';
var Promise = require("./core");
module.exports = Promise;
Promise.prototype['finally'] = function(f) {
  return this.then(function(value) {
    return Promise.resolve(f()).then(function() {
      return value;
    });
  }, function(err) {
    return Promise.resolve(f()).then(function() {
      throw err;
    });
  });
};
