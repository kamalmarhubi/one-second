/* */ 
'use strict';
var SyntheticEvent = require("./SyntheticEvent");
var getEventTarget = require("./getEventTarget");
var UIEventInterface = {
  view: function(event) {
    if (event.view) {
      return event.view;
    }
    var target = getEventTarget(event);
    if (target != null && target.window === target) {
      return target;
    }
    var doc = target.ownerDocument;
    if (doc) {
      return doc.defaultView || doc.parentWindow;
    } else {
      return window;
    }
  },
  detail: function(event) {
    return event.detail || 0;
  }
};
function SyntheticUIEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}
SyntheticEvent.augmentClass(SyntheticUIEvent, UIEventInterface);
module.exports = SyntheticUIEvent;
