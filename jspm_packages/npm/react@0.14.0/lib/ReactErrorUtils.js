/* */ 
(function(process) {
  'use strict';
  var caughtError = null;
  function invokeGuardedCallback(name, func, a, b) {
    try {
      return func(a, b);
    } catch (x) {
      if (caughtError === null) {
        caughtError = x;
      }
      return undefined;
    }
  }
  var ReactErrorUtils = {
    invokeGuardedCallback: invokeGuardedCallback,
    invokeGuardedCallbackWithCatch: invokeGuardedCallback,
    rethrowCaughtError: function() {
      if (caughtError) {
        var error = caughtError;
        caughtError = null;
        throw error;
      }
    }
  };
  if (process.env.NODE_ENV !== 'production') {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof Event === 'function') {
      var fakeNode = document.createElement('react');
      ReactErrorUtils.invokeGuardedCallback = function(name, func, a, b) {
        var boundFunc = func.bind(null, a, b);
        fakeNode.addEventListener(name, boundFunc, false);
        fakeNode.dispatchEvent(new Event(name));
        fakeNode.removeEventListener(name, boundFunc, false);
      };
    }
  }
  module.exports = ReactErrorUtils;
})(require("process"));
