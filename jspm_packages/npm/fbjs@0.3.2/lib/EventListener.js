/* */ 
(function(process) {
  'use strict';
  var emptyFunction = require("./emptyFunction");
  var EventListener = {
    listen: function(target, eventType, callback) {
      if (target.addEventListener) {
        target.addEventListener(eventType, callback, false);
        return {remove: function() {
            target.removeEventListener(eventType, callback, false);
          }};
      } else if (target.attachEvent) {
        target.attachEvent('on' + eventType, callback);
        return {remove: function() {
            target.detachEvent('on' + eventType, callback);
          }};
      }
    },
    capture: function(target, eventType, callback) {
      if (target.addEventListener) {
        target.addEventListener(eventType, callback, true);
        return {remove: function() {
            target.removeEventListener(eventType, callback, true);
          }};
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Attempted to listen to events during the capture phase on a ' + 'browser that does not support the capture phase. Your application ' + 'will not receive some events.');
        }
        return {remove: emptyFunction};
      }
    },
    registerDefault: function() {}
  };
  module.exports = EventListener;
})(require("process"));
