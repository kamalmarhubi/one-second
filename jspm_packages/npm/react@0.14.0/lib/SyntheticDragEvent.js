/* */ 
'use strict';
var SyntheticMouseEvent = require("./SyntheticMouseEvent");
var DragEventInterface = {dataTransfer: null};
function SyntheticDragEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}
SyntheticMouseEvent.augmentClass(SyntheticDragEvent, DragEventInterface);
module.exports = SyntheticDragEvent;
