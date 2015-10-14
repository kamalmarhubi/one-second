/* */ 
'use strict';
var EventConstants = require("./EventConstants");
var EventPluginUtils = require("./EventPluginUtils");
var EventPropagators = require("./EventPropagators");
var SyntheticUIEvent = require("./SyntheticUIEvent");
var TouchEventUtils = require("fbjs/lib/TouchEventUtils");
var ViewportMetrics = require("./ViewportMetrics");
var keyOf = require("fbjs/lib/keyOf");
var topLevelTypes = EventConstants.topLevelTypes;
var isStartish = EventPluginUtils.isStartish;
var isEndish = EventPluginUtils.isEndish;
var tapMoveThreshold = 10;
var startCoords = {
  x: null,
  y: null
};
var Axis = {
  x: {
    page: 'pageX',
    client: 'clientX',
    envScroll: 'currentPageScrollLeft'
  },
  y: {
    page: 'pageY',
    client: 'clientY',
    envScroll: 'currentPageScrollTop'
  }
};
function getAxisCoordOfEvent(axis, nativeEvent) {
  var singleTouch = TouchEventUtils.extractSingleTouch(nativeEvent);
  if (singleTouch) {
    return singleTouch[axis.page];
  }
  return axis.page in nativeEvent ? nativeEvent[axis.page] : nativeEvent[axis.client] + ViewportMetrics[axis.envScroll];
}
function getDistance(coords, nativeEvent) {
  var pageX = getAxisCoordOfEvent(Axis.x, nativeEvent);
  var pageY = getAxisCoordOfEvent(Axis.y, nativeEvent);
  return Math.pow(Math.pow(pageX - coords.x, 2) + Math.pow(pageY - coords.y, 2), 0.5);
}
var touchEvents = [topLevelTypes.topTouchStart, topLevelTypes.topTouchCancel, topLevelTypes.topTouchEnd, topLevelTypes.topTouchMove];
var dependencies = [topLevelTypes.topMouseDown, topLevelTypes.topMouseMove, topLevelTypes.topMouseUp].concat(touchEvents);
var eventTypes = {touchTap: {
    phasedRegistrationNames: {
      bubbled: keyOf({onTouchTap: null}),
      captured: keyOf({onTouchTapCapture: null})
    },
    dependencies: dependencies
  }};
var usedTouch = false;
var usedTouchTime = 0;
var TOUCH_DELAY = 1000;
var TapEventPlugin = {
  tapMoveThreshold: tapMoveThreshold,
  eventTypes: eventTypes,
  extractEvents: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
    if (!isStartish(topLevelType) && !isEndish(topLevelType)) {
      return null;
    }
    if (touchEvents.indexOf(topLevelType) !== -1) {
      usedTouch = true;
      usedTouchTime = Date.now();
    } else {
      if (usedTouch && Date.now() - usedTouchTime < TOUCH_DELAY) {
        return null;
      }
    }
    var event = null;
    var distance = getDistance(startCoords, nativeEvent);
    if (isEndish(topLevelType) && distance < tapMoveThreshold) {
      event = SyntheticUIEvent.getPooled(eventTypes.touchTap, topLevelTargetID, nativeEvent, nativeEventTarget);
    }
    if (isStartish(topLevelType)) {
      startCoords.x = getAxisCoordOfEvent(Axis.x, nativeEvent);
      startCoords.y = getAxisCoordOfEvent(Axis.y, nativeEvent);
    } else if (isEndish(topLevelType)) {
      startCoords.x = 0;
      startCoords.y = 0;
    }
    EventPropagators.accumulateTwoPhaseDispatches(event);
    return event;
  }
};
module.exports = TapEventPlugin;
