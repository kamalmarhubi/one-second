/* */ 
'use strict';
var CallbackQueue = require("./CallbackQueue");
var PooledClass = require("./PooledClass");
var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
var ReactDOMFeatureFlags = require("./ReactDOMFeatureFlags");
var ReactInputSelection = require("./ReactInputSelection");
var Transaction = require("./Transaction");
var assign = require("./Object.assign");
var SELECTION_RESTORATION = {
  initialize: ReactInputSelection.getSelectionInformation,
  close: ReactInputSelection.restoreSelection
};
var EVENT_SUPPRESSION = {
  initialize: function() {
    var currentlyEnabled = ReactBrowserEventEmitter.isEnabled();
    ReactBrowserEventEmitter.setEnabled(false);
    return currentlyEnabled;
  },
  close: function(previouslyEnabled) {
    ReactBrowserEventEmitter.setEnabled(previouslyEnabled);
  }
};
var ON_DOM_READY_QUEUEING = {
  initialize: function() {
    this.reactMountReady.reset();
  },
  close: function() {
    this.reactMountReady.notifyAll();
  }
};
var TRANSACTION_WRAPPERS = [SELECTION_RESTORATION, EVENT_SUPPRESSION, ON_DOM_READY_QUEUEING];
function ReactReconcileTransaction(forceHTML) {
  this.reinitializeTransaction();
  this.renderToStaticMarkup = false;
  this.reactMountReady = CallbackQueue.getPooled(null);
  this.useCreateElement = !forceHTML && ReactDOMFeatureFlags.useCreateElement;
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
assign(ReactReconcileTransaction.prototype, Transaction.Mixin, Mixin);
PooledClass.addPoolingTo(ReactReconcileTransaction);
module.exports = ReactReconcileTransaction;
