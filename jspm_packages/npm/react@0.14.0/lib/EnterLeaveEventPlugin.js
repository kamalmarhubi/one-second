/* */ 
'use strict';
var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var SyntheticMouseEvent = require("./SyntheticMouseEvent");
var ReactMount = require("./ReactMount");
var keyOf = require("fbjs/lib/keyOf");
var topLevelTypes = EventConstants.topLevelTypes;
var getFirstReactDOM = ReactMount.getFirstReactDOM;
var eventTypes = {
  mouseEnter: {
    registrationName: keyOf({onMouseEnter: null}),
    dependencies: [topLevelTypes.topMouseOut, topLevelTypes.topMouseOver]
  },
  mouseLeave: {
    registrationName: keyOf({onMouseLeave: null}),
    dependencies: [topLevelTypes.topMouseOut, topLevelTypes.topMouseOver]
  }
};
var extractedEvents = [null, null];
var EnterLeaveEventPlugin = {
  eventTypes: eventTypes,
  extractEvents: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
    if (topLevelType === topLevelTypes.topMouseOver && (nativeEvent.relatedTarget || nativeEvent.fromElement)) {
      return null;
    }
    if (topLevelType !== topLevelTypes.topMouseOut && topLevelType !== topLevelTypes.topMouseOver) {
      return null;
    }
    var win;
    if (topLevelTarget.window === topLevelTarget) {
      win = topLevelTarget;
    } else {
      var doc = topLevelTarget.ownerDocument;
      if (doc) {
        win = doc.defaultView || doc.parentWindow;
      } else {
        win = window;
      }
    }
    var from;
    var to;
    var fromID = '';
    var toID = '';
    if (topLevelType === topLevelTypes.topMouseOut) {
      from = topLevelTarget;
      fromID = topLevelTargetID;
      to = getFirstReactDOM(nativeEvent.relatedTarget || nativeEvent.toElement);
      if (to) {
        toID = ReactMount.getID(to);
      } else {
        to = win;
      }
      to = to || win;
    } else {
      from = win;
      to = topLevelTarget;
      toID = topLevelTargetID;
    }
    if (from === to) {
      return null;
    }
    var leave = SyntheticMouseEvent.getPooled(eventTypes.mouseLeave, fromID, nativeEvent, nativeEventTarget);
    leave.type = 'mouseleave';
    leave.target = from;
    leave.relatedTarget = to;
    var enter = SyntheticMouseEvent.getPooled(eventTypes.mouseEnter, toID, nativeEvent, nativeEventTarget);
    enter.type = 'mouseenter';
    enter.target = to;
    enter.relatedTarget = from;
    EventPropagators.accumulateEnterLeaveDispatches(leave, enter, fromID, toID);
    extractedEvents[0] = leave;
    extractedEvents[1] = enter;
    return extractedEvents;
  }
};
module.exports = EnterLeaveEventPlugin;
