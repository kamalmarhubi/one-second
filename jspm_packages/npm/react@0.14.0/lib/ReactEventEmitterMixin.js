/* */ 
'use strict';
var EventPluginHub = require("./EventPluginHub");
function runEventQueueInBatch(events) {
  EventPluginHub.enqueueEvents(events);
  EventPluginHub.processEventQueue(false);
}
var ReactEventEmitterMixin = {handleTopLevel: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
    var events = EventPluginHub.extractEvents(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget);
    runEventQueueInBatch(events);
  }};
module.exports = ReactEventEmitterMixin;
