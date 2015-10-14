/* */ 
'use strict';
var PooledClass = require("./PooledClass");
var CallbackQueue = require("./CallbackQueue");
var Transaction = require("./Transaction");
var assign = require("./Object.assign");
var emptyFunction = require("fbjs/lib/emptyFunction");
var ON_DOM_READY_QUEUEING = {
  initialize: function() {
    this.reactMountReady.reset();
  },
  close: emptyFunction
};
var TRANSACTION_WRAPPERS = [ON_DOM_READY_QUEUEING];
function ReactServerRenderingTransaction(renderToStaticMarkup) {
  this.reinitializeTransaction();
  this.renderToStaticMarkup = renderToStaticMarkup;
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.useCreateElement = false;
}
var Mixin = {
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },
  getReactMountReady: function() {
    return this.reactMountReady;
  },
  destructor: function() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;
  }
};
assign(ReactServerRenderingTransaction.prototype, Transaction.Mixin, Mixin);
PooledClass.addPoolingTo(ReactServerRenderingTransaction);
module.exports = ReactServerRenderingTransaction;
