/* */ 
(function(process) {
  'use strict';
  var ReactOwner = require("./ReactOwner");
  var ReactRef = {};
  function attachRef(ref, component, owner) {
    if (typeof ref === 'function') {
      ref(component.getPublicInstance());
    } else {
      ReactOwner.addComponentAsRefTo(component, ref, owner);
    }
  }
  function detachRef(ref, component, owner) {
    if (typeof ref === 'function') {
      ref(null);
    } else {
      ReactOwner.removeComponentAsRefFrom(component, ref, owner);
    }
  }
  ReactRef.attachRefs = function(instance, element) {
    if (element === null || element === false) {
      return;
    }
    var ref = element.ref;
    if (ref != null) {
      attachRef(ref, instance, element._owner);
    }
  };
  ReactRef.shouldUpdateRefs = function(prevElement, nextElement) {
    var prevEmpty = prevElement === null || prevElement === false;
    var nextEmpty = nextElement === null || nextElement === false;
    return (prevEmpty || nextEmpty || nextElement._owner !== prevElement._owner || nextElement.ref !== prevElement.ref);
  };
  ReactRef.detachRefs = function(instance, element) {
    if (element === null || element === false) {
      return;
    }
    var ref = element.ref;
    if (ref != null) {
      detachRef(ref, instance, element._owner);
    }
  };
  module.exports = ReactRef;
})(require("process"));
