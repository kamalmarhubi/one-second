/* */ 
(function(process) {
  'use strict';
  var EventPluginRegistry = require("./EventPluginRegistry");
  var EventPluginUtils = require("./EventPluginUtils");
  var ReactErrorUtils = require("./ReactErrorUtils");
  var accumulateInto = require("./accumulateInto");
  var forEachAccumulated = require("./forEachAccumulated");
  var invariant = require("fbjs/lib/invariant");
  var warning = require("fbjs/lib/warning");
  var listenerBank = {};
  var eventQueue = null;
  var executeDispatchesAndRelease = function(event, simulated) {
    if (event) {
      EventPluginUtils.executeDispatchesInOrder(event, simulated);
      if (!event.isPersistent()) {
        event.constructor.release(event);
      }
    }
  };
  var executeDispatchesAndReleaseSimulated = function(e) {
    return executeDispatchesAndRelease(e, true);
  };
  var executeDispatchesAndReleaseTopLevel = function(e) {
    return executeDispatchesAndRelease(e, false);
  };
  var InstanceHandle = null;
  function validateInstanceHandle() {
    var valid = InstanceHandle && InstanceHandle.traverseTwoPhase && InstanceHandle.traverseEnterLeave;
    process.env.NODE_ENV !== 'production' ? warning(valid, 'InstanceHandle not injected before use!') : undefined;
  }
  var EventPluginHub = {
    injection: {
      injectMount: EventPluginUtils.injection.injectMount,
      injectInstanceHandle: function(InjectedInstanceHandle) {
        InstanceHandle = InjectedInstanceHandle;
        if (process.env.NODE_ENV !== 'production') {
          validateInstanceHandle();
        }
      },
      getInstanceHandle: function() {
        if (process.env.NODE_ENV !== 'production') {
          validateInstanceHandle();
        }
        return InstanceHandle;
      },
      injectEventPluginOrder: EventPluginRegistry.injectEventPluginOrder,
      injectEventPluginsByName: EventPluginRegistry.injectEventPluginsByName
    },
    eventNameDispatchConfigs: EventPluginRegistry.eventNameDispatchConfigs,
    registrationNameModules: EventPluginRegistry.registrationNameModules,
    putListener: function(id, registrationName, listener) {
      !(typeof listener === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Expected %s listener to be a function, instead got type %s', registrationName, typeof listener) : invariant(false) : undefined;
      var bankForRegistrationName = listenerBank[registrationName] || (listenerBank[registrationName] = {});
      bankForRegistrationName[id] = listener;
      var PluginModule = EventPluginRegistry.registrationNameModules[registrationName];
      if (PluginModule && PluginModule.didPutListener) {
        PluginModule.didPutListener(id, registrationName, listener);
      }
    },
    getListener: function(id, registrationName) {
      var bankForRegistrationName = listenerBank[registrationName];
      return bankForRegistrationName && bankForRegistrationName[id];
    },
    deleteListener: function(id, registrationName) {
      var PluginModule = EventPluginRegistry.registrationNameModules[registrationName];
      if (PluginModule && PluginModule.willDeleteListener) {
        PluginModule.willDeleteListener(id, registrationName);
      }
      var bankForRegistrationName = listenerBank[registrationName];
      if (bankForRegistrationName) {
        delete bankForRegistrationName[id];
      }
    },
    deleteAllListeners: function(id) {
      for (var registrationName in listenerBank) {
        if (!listenerBank[registrationName][id]) {
          continue;
        }
        var PluginModule = EventPluginRegistry.registrationNameModules[registrationName];
        if (PluginModule && PluginModule.willDeleteListener) {
          PluginModule.willDeleteListener(id, registrationName);
        }
        delete listenerBank[registrationName][id];
      }
    },
    extractEvents: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
      var events;
      var plugins = EventPluginRegistry.plugins;
      for (var i = 0; i < plugins.length; i++) {
        var possiblePlugin = plugins[i];
        if (possiblePlugin) {
          var extractedEvents = possiblePlugin.extractEvents(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget);
          if (extractedEvents) {
            events = accumulateInto(events, extractedEvents);
          }
        }
      }
      return events;
    },
    enqueueEvents: function(events) {
      if (events) {
        eventQueue = accumulateInto(eventQueue, events);
      }
    },
    processEventQueue: function(simulated) {
      var processingEventQueue = eventQueue;
      eventQueue = null;
      if (simulated) {
        forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseSimulated);
      } else {
        forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel);
      }
      !!eventQueue ? process.env.NODE_ENV !== 'production' ? invariant(false, 'processEventQueue(): Additional events were enqueued while processing ' + 'an event queue. Support for this has not yet been implemented.') : invariant(false) : undefined;
      ReactErrorUtils.rethrowCaughtError();
    },
    __purge: function() {
      listenerBank = {};
    },
    __getListenerBank: function() {
      return listenerBank;
    }
  };
  module.exports = EventPluginHub;
})(require("process"));
