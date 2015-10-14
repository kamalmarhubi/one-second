/* */ 
'use strict';
var SyntheticEvent = require("./SyntheticEvent");
var ResponderEventInterface = {touchHistory: function(nativeEvent) {
    return null;
  }};
function ResponderSyntheticEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}
SyntheticEvent.augmentClass(ResponderSyntheticEvent, ResponderEventInterface);
module.exports = ResponderSyntheticEvent;
