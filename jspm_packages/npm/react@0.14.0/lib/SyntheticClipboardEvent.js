/* */ 
'use strict';
var SyntheticEvent = require("./SyntheticEvent");
var ClipboardEventInterface = {clipboardData: function(event) {
    return 'clipboardData' in event ? event.clipboardData : window.clipboardData;
  }};
function SyntheticClipboardEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}
SyntheticEvent.augmentClass(SyntheticClipboardEvent, ClipboardEventInterface);
module.exports = SyntheticClipboardEvent;
