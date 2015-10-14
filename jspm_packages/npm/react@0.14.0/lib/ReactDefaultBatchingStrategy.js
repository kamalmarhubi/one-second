/* */ 
'use strict';
var ReactUpdates = require("./ReactUpdates");
var Transaction = require("./Transaction");
var assign = require("./Object.assign");
var emptyFunction = require("fbjs/lib/emptyFunction");
var RESET_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: function() {
    ReactDefaultBatchingStrategy.isBatchingUpdates = false;
  }
};
var FLUSH_BATCHED_UPDATES = {
  initialize: emptyFunction,
  close: ReactUpdates.flushBatchedUpdates.bind(ReactUpdates)
};
var TRANSACTION_WRAPPERS = [FLUSH_BATCHED_UPDATES, RESET_BATCHED_UPDATES];
function ReactDefaultBatchingStrategyTransaction() {
  this.reinitializeTransaction();
}
assign(ReactDefaultBatchingStrategyTransaction.prototype, Transaction.Mixin, {getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  }});
var transaction = new ReactDefaultBatchingStrategyTransaction();
var ReactDefaultBatchingStrategy = {
  isBatchingUpdates: false,
  batchedUpdates: function(callback, a, b, c, d, e) {
    var alreadyBatchingUpdates = ReactDefaultBatchingStrategy.isBatchingUpdates;
    ReactDefaultBatchingStrategy.isBatchingUpdates = true;
    if (alreadyBatchingUpdates) {
      callback(a, b, c, d, e);
    } else {
      transaction.perform(callback, null, a, b, c, d, e);
    }
  }
};
module.exports = ReactDefaultBatchingStrategy;
