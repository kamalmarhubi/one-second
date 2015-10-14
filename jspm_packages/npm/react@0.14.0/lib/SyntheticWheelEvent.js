/* */ 
'use strict';
var SyntheticMouseEvent = require("./SyntheticMouseEvent");
var WheelEventInterface = {
  deltaX: function(event) {
    return 'deltaX' in event ? event.deltaX : 'wheelDeltaX' in event ? -event.wheelDeltaX : 0;
  },
  deltaY: function(event) {
    return 'deltaY' in event ? event.deltaY : 'wheelDeltaY' in event ? -event.wheelDeltaY : 'wheelDelta' in event ? -event.wheelDelta : 0;
  },
  deltaZ: null,
  deltaMode: null
};
function SyntheticWheelEvent(dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget) {
  SyntheticMouseEvent.call(this, dispatchConfig, dispatchMarker, nativeEvent, nativeEventTarget);
}
SyntheticMouseEvent.augmentClass(SyntheticWheelEvent, WheelEventInterface);
module.exports = SyntheticWheelEvent;
