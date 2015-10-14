/* */ 
(function(process) {
  'use strict';
  var ReactReconciler = require("./ReactReconciler");
  var instantiateReactComponent = require("./instantiateReactComponent");
  var shouldUpdateReactComponent = require("./shouldUpdateReactComponent");
  var traverseAllChildren = require("./traverseAllChildren");
  var warning = require("fbjs/lib/warning");
  function instantiateChild(childInstances, child, name) {
    var keyUnique = childInstances[name] === undefined;
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(keyUnique, 'flattenChildren(...): Encountered two children with the same key, ' + '`%s`. Child keys must be unique; when two children share a key, only ' + 'the first child will be used.', name) : undefined;
    }
    if (child != null && keyUnique) {
      childInstances[name] = instantiateReactComponent(child, null);
    }
  }
  var ReactChildReconciler = {
    instantiateChildren: function(nestedChildNodes, transaction, context) {
      if (nestedChildNodes == null) {
        return null;
      }
      var childInstances = {};
      traverseAllChildren(nestedChildNodes, instantiateChild, childInstances);
      return childInstances;
    },
    updateChildren: function(prevChildren, nextChildren, transaction, context) {
      if (!nextChildren && !prevChildren) {
        return null;
      }
      var name;
      for (name in nextChildren) {
        if (!nextChildren.hasOwnProperty(name)) {
          continue;
        }
        var prevChild = prevChildren && prevChildren[name];
        var prevElement = prevChild && prevChild._currentElement;
        var nextElement = nextChildren[name];
        if (prevChild != null && shouldUpdateReactComponent(prevElement, nextElement)) {
          ReactReconciler.receiveComponent(prevChild, nextElement, transaction, context);
          nextChildren[name] = prevChild;
        } else {
          if (prevChild) {
            ReactReconciler.unmountComponent(prevChild, name);
          }
          var nextChildInstance = instantiateReactComponent(nextElement, null);
          nextChildren[name] = nextChildInstance;
        }
      }
      for (name in prevChildren) {
        if (prevChildren.hasOwnProperty(name) && !(nextChildren && nextChildren.hasOwnProperty(name))) {
          ReactReconciler.unmountComponent(prevChildren[name]);
        }
      }
      return nextChildren;
    },
    unmountChildren: function(renderedChildren) {
      for (var name in renderedChildren) {
        if (renderedChildren.hasOwnProperty(name)) {
          var renderedChild = renderedChildren[name];
          ReactReconciler.unmountComponent(renderedChild);
        }
      }
    }
  };
  module.exports = ReactChildReconciler;
})(require("process"));
