/* */ 
'use strict';
var SyntheticEvent = require("./SyntheticEvent");
var CompositionEventInterface = {data: null};
function SyntheticCompositionEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}
SyntheticEvent.augmentClass(SyntheticCompositionEvent, CompositionEventInterface);
module.exports = SyntheticCompositionEvent;
