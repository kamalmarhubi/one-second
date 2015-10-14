/* */ 
'use strict';
var SyntheticUIEvent = require("./SyntheticUIEvent");
var FocusEventInterface = {relatedTarget: null};
function SyntheticFocusEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticUIEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}
SyntheticUIEvent.augmentClass(SyntheticFocusEvent, FocusEventInterface);
module.exports = SyntheticFocusEvent;
