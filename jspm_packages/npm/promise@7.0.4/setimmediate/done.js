/* */ 
'use strict';
var Promise = require("./core");
module.exports = Promise;
Promise.prototype.done = function(onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this;
  self.then(null, function(err) {
    setTimeout(function() {
      throw err;
    }, 0);
  });
};
