/* */ 
(function(process) {
  'use strict';
  var invariant = require("fbjs/lib/invariant");
  var EventPluginOrder = null;
  var namesToPlugins = {};
  function recomputePluginOrdering() {
    if (!EventPluginOrder) {
      return;
    }
    for (var pluginName in namesToPlugins) {
      var PluginModule = namesToPlugins[pluginName];
      var pluginIndex = EventPluginOrder.indexOf(pluginName);
      !(pluginIndex > -1) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginRegistry: Cannot inject event plugins that do not exist in ' + 'the plugin ordering, `%s`.', pluginName) : invariant(false) : undefined;
      if (EventPluginRegistry.plugins[pluginIndex]) {
        continue;
      }
      !PluginModule.extractEvents ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginRegistry: Event plugins must implement an `extractEvents` ' + 'method, but `%s` does not.', pluginName) : invariant(false) : undefined;
      EventPluginRegistry.plugins[pluginIndex] = PluginModule;
      var publishedEvents = PluginModule.eventTypes;
      for (var eventName in publishedEvents) {
        !publishEventForPlugin(publishedEvents[eventName], PluginModule, eventName) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.', eventName, pluginName) : invariant(false) : undefined;
      }
    }
  }
  function publishEventForPlugin(dispatchConfig, PluginModule, eventName) {
    !!EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginHub: More than one plugin attempted to publish the same ' + 'event name, `%s`.', eventName) : invariant(false) : undefined;
    EventPluginRegistry.eventNameDispatchConfigs[eventName] = dispatchConfig;
    var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
    if (phasedRegistrationNames) {
      for (var phaseName in phasedRegistrationNames) {
        if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
          var phasedRegistrationName = phasedRegistrationNames[phaseName];
          publishRegistrationName(phasedRegistrationName, PluginModule, eventName);
        }
      }
      return true;
    } else if (dispatchConfig.registrationName) {
      publishRegistrationName(dispatchConfig.registrationName, PluginModule, eventName);
      return true;
    }
    return false;
  }
  function publishRegistrationName(registrationName, PluginModule, eventName) {
    !!EventPluginRegistry.registrationNameModules[registrationName] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginHub: More than one plugin attempted to publish the same ' + 'registration name, `%s`.', registrationName) : invariant(false) : undefined;
    EventPluginRegistry.registrationNameModules[registrationName] = PluginModule;
    EventPluginRegistry.registrationNameDependencies[registrationName] = PluginModule.eventTypes[eventName].dependencies;
  }
  var EventPluginRegistry = {
    plugins: [],
    eventNameDispatchConfigs: {},
    registrationNameModules: {},
    registrationNameDependencies: {},
    injectEventPluginOrder: function(InjectedEventPluginOrder) {
      !!EventPluginOrder ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginRegistry: Cannot inject event plugin ordering more than ' + 'once. You are likely trying to load more than one copy of React.') : invariant(false) : undefined;
      EventPluginOrder = Array.prototype.slice.call(InjectedEventPluginOrder);
      recomputePluginOrdering();
    },
    injectEventPluginsByName: function(injectedNamesToPlugins) {
      var isOrderingDirty = false;
      for (var pluginName in injectedNamesToPlugins) {
        if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
          continue;
        }
        var PluginModule = injectedNamesToPlugins[pluginName];
        if (!namesToPlugins.hasOwnProperty(pluginName) || namesToPlugins[pluginName] !== PluginModule) {
          !!namesToPlugins[pluginName] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'EventPluginRegistry: Cannot inject two different event plugins ' + 'using the same name, `%s`.', pluginName) : invariant(false) : undefined;
          namesToPlugins[pluginName] = PluginModule;
          isOrderingDirty = true;
        }
      }
      if (isOrderingDirty) {
        recomputePluginOrdering();
      }
    },
    getPluginModuleForEvent: function(event) {
      var dispatchConfig = event.dispatchConfig;
      if (dispatchConfig.registrationName) {
        return EventPluginRegistry.registrationNameModules[dispatchConfig.registrationName] || null;
      }
      for (var phase in dispatchConfig.phasedRegistrationNames) {
        if (!dispatchConfig.phasedRegistrationNames.hasOwnProperty(phase)) {
          continue;
        }
        var PluginModule = EventPluginRegistry.registrationNameModules[dispatchConfig.phasedRegistrationNames[phase]];
        if (PluginModule) {
          return PluginModule;
        }
      }
      return null;
    },
    _resetEventPlugins: function() {
      EventPluginOrder = null;
      for (var pluginName in namesToPlugins) {
        if (namesToPlugins.hasOwnProperty(pluginName)) {
          delete namesToPlugins[pluginName];
        }
      }
      EventPluginRegistry.plugins.length = 0;
      var eventNameDispatchConfigs = EventPluginRegistry.eventNameDispatchConfigs;
      for (var eventName in eventNameDispatchConfigs) {
        if (eventNameDispatchConfigs.hasOwnProperty(eventName)) {
          delete eventNameDispatchConfigs[eventName];
        }
      }
      var registrationNameModules = EventPluginRegistry.registrationNameModules;
      for (var registrationName in registrationNameModules) {
        if (registrationNameModules.hasOwnProperty(registrationName)) {
          delete registrationNameModules[registrationName];
        }
      }
    }
  };
  module.exports = EventPluginRegistry;
})(require("process"));
