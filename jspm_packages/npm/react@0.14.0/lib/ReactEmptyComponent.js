/* */ 
'use strict';
var ReactElement = require("./ReactElement");
var ReactEmptyComponentRegistry = require("./ReactEmptyComponentRegistry");
var ReactReconciler = require("./ReactReconciler");
var assign = require("./Object.assign");
var placeholderElement;
var ReactEmptyComponentInjection = {injectEmptyComponent: function(component) {
    placeholderElement = ReactElement.createElement(component);
  }};
var ReactEmptyComponent = function(instantiate) {
  this._currentElement = null;
  this._rootNodeID = null;
  this._renderedComponent = instantiate(placeholderElement);
};
assign(ReactEmptyComponent.prototype, {
  construct: function(element) {},
  mountComponent: function(rootID, transaction, context) {
    ReactEmptyComponentRegistry.registerNullComponentID(rootID);
    this._rootNodeID = rootID;
    return ReactReconciler.mountComponent(this._renderedComponent, rootID, transaction, context);
  },
  receiveComponent: function() {},
  unmountComponent: function(rootID, transaction, context) {
    ReactReconciler.unmountComponent(this._renderedComponent);
    ReactEmptyComponentRegistry.deregisterNullComponentID(this._rootNodeID);
    this._rootNodeID = null;
    this._renderedComponent = null;
  }
});
ReactEmptyComponent.injection = ReactEmptyComponentInjection;
module.exports = ReactEmptyComponent;
