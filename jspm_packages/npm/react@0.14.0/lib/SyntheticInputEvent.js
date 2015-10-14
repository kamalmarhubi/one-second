/* */ 
'use strict';
var SyntheticEvent = require("./SyntheticEvent");
var InputEventInterface = {data: null};
function SyntheticInputEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}
SyntheticEvent.augmentClass(SyntheticInputEvent, InputEventInterface);
module.exports = SyntheticInputEvent;
