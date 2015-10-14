/* */ 
'use strict';
var SyntheticUIEvent = require("./SyntheticUIEvent");
var getEventModifierState = require("./getEventModifierState");
var TouchEventInterface = {
  touches: null,
  targetTouches: null,
  changedTouches: null,
  altKey: null,
  metaKey: null,
  ctrlKey: null,
  shiftKey: null,
  getModifierState: getEventModifierState
};
function SyntheticTouchEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}
SyntheticUIEvent.augmentClass(SyntheticTouchEvent, TouchEventInterface);
module.exports = SyntheticTouchEvent;
