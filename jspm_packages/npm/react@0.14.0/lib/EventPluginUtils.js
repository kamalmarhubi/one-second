/* */ 
(function(process) {
  'use strict';
  var EventConstants = require("./EventConstants");
  var ReactErrorUtils = require("./ReactErrorUtils");
  var invariant = require("fbjs/lib/invariant");
  var warning = require("fbjs/lib/warning");
  var injection = {
    Mount: null,
    injectMount: function(InjectedMount) {
      injection.Mount = InjectedMount;
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(InjectedMount && InjectedMount.getNode && InjectedMount.getID, 'EventPluginUtils.injection.injectMount(...): Injected Mount ' + 'module is missing getNode or getID.') : undefined;
      }
    }
  };
  var topLevelTypes = EventConstants.topLevelTypes;
  function isEndish(topLevelType) {
    return topLevelType === topLevelTypes.topMouseUp || topLevelType === topLevelTypes.topTouchEnd || topLevelType === topLevelTypes.topTouchCancel;
  }
  function isMoveish(topLevelType) {
    return topLevelType === topLevelTypes.topMouseMove || topLevelType === topLevelTypes.topTouchMove;
  }
  function isStartish(topLevelType) {
    return topLevelType === topLevelTypes.topMouseDown || topLevelType === topLevelTypes.topTouchStart;
  }
  var validateEventDispatches;
  if (process.env.NODE_ENV !== 'production') {
    validateEventDispatches = function(event) {
      var dispatchListeners = event._dispatchListeners;
      var dispatchIDs = event._dispatchIDs;
      var listenersIsArr = Array.isArray(dispatchListeners);
      var idsIsArr = Array.isArray(dispatchIDs);
      var IDsLen = idsIsArr ? dispatchIDs.length : dispatchIDs ? 1 : 0;
      var listenersLen = listenersIsArr ? dispatchListeners.length : dispatchListeners ? 1 : 0;
      process.env.NODE_ENV !== 'production' ? warning(idsIsArr === listenersIsArr && IDsLen === listenersLen, 'EventPluginUtils: Invalid `event`.') : undefined;
    };
  }
  function executeDispatch(event, simulated, listener, domID) {
    var type = event.type || 'unknown-event';
    event.currentTarget = injection.Mount.getNode(domID);
    if (simulated) {
      ReactErrorUtils.invokeGuardedCallbackWithCatch(type, listener, event, domID);
    } else {
      ReactErrorUtils.invokeGuardedCallback(type, listener, event, domID);
    }
    event.currentTarget = null;
  }
  function executeDispatchesInOrder(event, simulated) {
    var dispatchListeners = event._dispatchListeners;
    var dispatchIDs = event._dispatchIDs;
    if (process.env.NODE_ENV !== 'production') {
      validateEventDispatches(event);
    }
    if (Array.isArray(dispatchListeners)) {
      for (var i = 0; i < dispatchListeners.length; i++) {
        if (event.isPropagationStopped()) {
          break;
        }
        executeDispatch(event, simulated, dispatchListeners[i], dispatchIDs[i]);
      }
    } else if (dispatchListeners) {
      executeDispatch(event, simulated, dispatchListeners, dispatchIDs);
    }
    event._dispatchListeners = null;
    event._dispatchIDs = null;
  }
  function executeDispatchesInOrderStopAtTrueImpl(event) {
    var dispatchListeners = event._dispatchListeners;
    var dispatchIDs = event._dispatchIDs;
    if (process.env.NODE_ENV !== 'production') {
      validateEventDispatches(event);
    }
    if (Array.isArray(dispatchListeners)) {
      for (var i = 0; i < dispatchListeners.length; i++) {
        if (event.isPropagationStopped()) {
          break;
        }
        if (dispatchListeners[i](event, dispatchIDs[i])) {
          return dispatchIDs[i];
        }
      }
    } else if (dispatchListeners) {
      if (dispatchListeners(event, dispatchIDs)) {
        return dispatchIDs;
      }
    }
    return null;
  }
  function executeDispatchesInOrderStopAtTrue(event) {
    var ret = executeDispatchesInOrderStopAtTrueImpl(event);
    event._dispatchIDs = null;
    event._dispatchListeners = null;
    return ret;
  }
  function executeDirectDispatch(event) {
    if (process.env.NODE_ENV !== 'production') {
      validateEventDispatches(event);
    }
    var dispatchListener = event._dispatchListeners;
    var dispatchID = event._dispatchIDs;
    !!Array.isArray(dispatchListener) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'executeDirectDispatch(...): Invalid `event`.') : invariant(false) : undefined;
    var res = dispatchListener ? dispatchListener(event, dispatchID) : null;
    event._dispatchListeners = null;
    event._dispatchIDs = null;
    return res;
  }
  function hasDispatches(event) {
    return !!event._dispatchListeners;
  }
  var EventPluginUtils = {
    isEndish: isEndish,
    isMoveish: isMoveish,
    isStartish: isStartish,
    executeDirectDispatch: executeDirectDispatch,
    executeDispatchesInOrder: executeDispatchesInOrder,
    executeDispatchesInOrderStopAtTrue: executeDispatchesInOrderStopAtTrue,
    hasDispatches: hasDispatches,
    getNode: function(id) {
      return injection.Mount.getNode(id);
    },
    getID: function(node) {
      return injection.Mount.getID(node);
    },
    injection: injection
  };
  module.exports = EventPluginUtils;
})(require("process"));
