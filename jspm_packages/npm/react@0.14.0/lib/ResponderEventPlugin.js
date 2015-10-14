/* */ 
(function(process) {
  'use strict';
  var EventConstants = require("./EventConstants");
  var EventPluginUtils = require("./EventPluginUtils");
  var EventPropagators = require("./EventPropagators");
  var ReactInstanceHandles = require("./ReactInstanceHandles");
  var ResponderSyntheticEvent = require("./ResponderSyntheticEvent");
  var ResponderTouchHistoryStore = require("./ResponderTouchHistoryStore");
  var accumulate = require("./accumulate");
  var invariant = require("fbjs/lib/invariant");
  var keyOf = require("fbjs/lib/keyOf");
  var isStartish = EventPluginUtils.isStartish;
  var isMoveish = EventPluginUtils.isMoveish;
  var isEndish = EventPluginUtils.isEndish;
  var executeDirectDispatch = EventPluginUtils.executeDirectDispatch;
  var hasDispatches = EventPluginUtils.hasDispatches;
  var executeDispatchesInOrderStopAtTrue = EventPluginUtils.executeDispatchesInOrderStopAtTrue;
  var responderID = null;
  var trackedTouchCount = 0;
  var previousActiveTouches = 0;
  var changeResponder = function(nextResponderID) {
    var oldResponderID = responderID;
    responderID = nextResponderID;
    if (ResponderEventPlugin.GlobalResponderHandler !== null) {
      ResponderEventPlugin.GlobalResponderHandler.onChange(oldResponderID, nextResponderID);
    }
  };
  var eventTypes = {
    startShouldSetResponder: {phasedRegistrationNames: {
        bubbled: keyOf({onStartShouldSetResponder: null}),
        captured: keyOf({onStartShouldSetResponderCapture: null})
      }},
    scrollShouldSetResponder: {phasedRegistrationNames: {
        bubbled: keyOf({onScrollShouldSetResponder: null}),
        captured: keyOf({onScrollShouldSetResponderCapture: null})
      }},
    selectionChangeShouldSetResponder: {phasedRegistrationNames: {
        bubbled: keyOf({onSelectionChangeShouldSetResponder: null}),
        captured: keyOf({onSelectionChangeShouldSetResponderCapture: null})
      }},
    moveShouldSetResponder: {phasedRegistrationNames: {
        bubbled: keyOf({onMoveShouldSetResponder: null}),
        captured: keyOf({onMoveShouldSetResponderCapture: null})
      }},
    responderStart: {registrationName: keyOf({onResponderStart: null})},
    responderMove: {registrationName: keyOf({onResponderMove: null})},
    responderEnd: {registrationName: keyOf({onResponderEnd: null})},
    responderRelease: {registrationName: keyOf({onResponderRelease: null})},
    responderTerminationRequest: {registrationName: keyOf({onResponderTerminationRequest: null})},
    responderGrant: {registrationName: keyOf({onResponderGrant: null})},
    responderReject: {registrationName: keyOf({onResponderReject: null})},
    responderTerminate: {registrationName: keyOf({onResponderTerminate: null})}
  };
  function setResponderAndExtractTransfer(topLevelType, topLevelTargetID, nativeEvent, nativeEventTarget) {
    var shouldSetEventType = isStartish(topLevelType) ? eventTypes.startShouldSetResponder : isMoveish(topLevelType) ? eventTypes.moveShouldSetResponder : topLevelType === EventConstants.topLevelTypes.topSelectionChange ? eventTypes.selectionChangeShouldSetResponder : eventTypes.scrollShouldSetResponder;
    var bubbleShouldSetFrom = !responderID ? topLevelTargetID : ReactInstanceHandles.getFirstCommonAncestorID(responderID, topLevelTargetID);
    var skipOverBubbleShouldSetFrom = bubbleShouldSetFrom === responderID;
    var shouldSetEvent = ResponderSyntheticEvent.getPooled(shouldSetEventType, bubbleShouldSetFrom, nativeEvent, nativeEventTarget);
    shouldSetEvent.touchHistory = ResponderTouchHistoryStore.touchHistory;
    if (skipOverBubbleShouldSetFrom) {
      EventPropagators.accumulateTwoPhaseDispatchesSkipTarget(shouldSetEvent);
    } else {
      EventPropagators.accumulateTwoPhaseDispatches(shouldSetEvent);
    }
    var wantsResponderID = executeDispatchesInOrderStopAtTrue(shouldSetEvent);
    if (!shouldSetEvent.isPersistent()) {
      shouldSetEvent.constructor.release(shouldSetEvent);
    }
    if (!wantsResponderID || wantsResponderID === responderID) {
      return null;
    }
    var extracted;
    var grantEvent = ResponderSyntheticEvent.getPooled(eventTypes.responderGrant, wantsResponderID, nativeEvent, nativeEventTarget);
    grantEvent.touchHistory = ResponderTouchHistoryStore.touchHistory;
    EventPropagators.accumulateDirectDispatches(grantEvent);
    if (responderID) {
      var terminationRequestEvent = ResponderSyntheticEvent.getPooled(eventTypes.responderTerminationRequest, responderID, nativeEvent, nativeEventTarget);
      terminationRequestEvent.touchHistory = ResponderTouchHistoryStore.touchHistory;
      EventPropagators.accumulateDirectDispatches(terminationRequestEvent);
      var shouldSwitch = !hasDispatches(terminationRequestEvent) || executeDirectDispatch(terminationRequestEvent);
      if (!terminationRequestEvent.isPersistent()) {
        terminationRequestEvent.constructor.release(terminationRequestEvent);
      }
      if (shouldSwitch) {
        var terminateType = eventTypes.responderTerminate;
        var terminateEvent = ResponderSyntheticEvent.getPooled(terminateType, responderID, nativeEvent, nativeEventTarget);
        terminateEvent.touchHistory = ResponderTouchHistoryStore.touchHistory;
        EventPropagators.accumulateDirectDispatches(terminateEvent);
        extracted = accumulate(extracted, [grantEvent, terminateEvent]);
        changeResponder(wantsResponderID);
      } else {
        var rejectEvent = ResponderSyntheticEvent.getPooled(eventTypes.responderReject, wantsResponderID, nativeEvent, nativeEventTarget);
        rejectEvent.touchHistory = ResponderTouchHistoryStore.touchHistory;
        EventPropagators.accumulateDirectDispatches(rejectEvent);
        extracted = accumulate(extracted, rejectEvent);
      }
    } else {
      extracted = accumulate(extracted, grantEvent);
      changeResponder(wantsResponderID);
    }
    return extracted;
  }
  function canTriggerTransfer(topLevelType, topLevelTargetID) {
    return topLevelTargetID && (topLevelType === EventConstants.topLevelTypes.topScroll || trackedTouchCount > 0 && topLevelType === EventConstants.topLevelTypes.topSelectionChange || isStartish(topLevelType) || isMoveish(topLevelType));
  }
  function noResponderTouches(nativeEvent) {
    var touches = nativeEvent.touches;
    if (!touches || touches.length === 0) {
      return true;
    }
    for (var i = 0; i < touches.length; i++) {
      var activeTouch = touches[i];
      var target = activeTouch.target;
      if (target !== null && target !== undefined && target !== 0) {
        var isAncestor = ReactInstanceHandles.isAncestorIDOf(responderID, EventPluginUtils.getID(target));
        if (isAncestor) {
          return false;
        }
      }
    }
    return true;
  }
  var ResponderEventPlugin = {
    getResponderID: function() {
      return responderID;
    },
    eventTypes: eventTypes,
    extractEvents: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
      if (isStartish(topLevelType)) {
        trackedTouchCount += 1;
      } else if (isEndish(topLevelType)) {
        trackedTouchCount -= 1;
        !(trackedTouchCount >= 0) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Ended a touch event which was not counted in trackedTouchCount.') : invariant(false) : undefined;
      }
      ResponderTouchHistoryStore.recordTouchTrack(topLevelType, nativeEvent, nativeEventTarget);
      var extracted = canTriggerTransfer(topLevelType, topLevelTargetID) ? setResponderAndExtractTransfer(topLevelType, topLevelTargetID, nativeEvent, nativeEventTarget) : null;
      var isResponderTouchStart = responderID && isStartish(topLevelType);
      var isResponderTouchMove = responderID && isMoveish(topLevelType);
      var isResponderTouchEnd = responderID && isEndish(topLevelType);
      var incrementalTouch = isResponderTouchStart ? eventTypes.responderStart : isResponderTouchMove ? eventTypes.responderMove : isResponderTouchEnd ? eventTypes.responderEnd : null;
      if (incrementalTouch) {
        var gesture = ResponderSyntheticEvent.getPooled(incrementalTouch, responderID, nativeEvent, nativeEventTarget);
        gesture.touchHistory = ResponderTouchHistoryStore.touchHistory;
        EventPropagators.accumulateDirectDispatches(gesture);
        extracted = accumulate(extracted, gesture);
      }
      var isResponderTerminate = responderID && topLevelType === EventConstants.topLevelTypes.topTouchCancel;
      var isResponderRelease = responderID && !isResponderTerminate && isEndish(topLevelType) && noResponderTouches(nativeEvent);
      var finalTouch = isResponderTerminate ? eventTypes.responderTerminate : isResponderRelease ? eventTypes.responderRelease : null;
      if (finalTouch) {
        var finalEvent = ResponderSyntheticEvent.getPooled(finalTouch, responderID, nativeEvent, nativeEventTarget);
        finalEvent.touchHistory = ResponderTouchHistoryStore.touchHistory;
        EventPropagators.accumulateDirectDispatches(finalEvent);
        extracted = accumulate(extracted, finalEvent);
        changeResponder(null);
      }
      var numberActiveTouches = ResponderTouchHistoryStore.touchHistory.numberActiveTouches;
      if (ResponderEventPlugin.GlobalInteractionHandler && numberActiveTouches !== previousActiveTouches) {
        ResponderEventPlugin.GlobalInteractionHandler.onChange(numberActiveTouches);
      }
      previousActiveTouches = numberActiveTouches;
      return extracted;
    },
    GlobalResponderHandler: null,
    GlobalInteractionHandler: null,
    injection: {
      injectGlobalResponderHandler: function(GlobalResponderHandler) {
        ResponderEventPlugin.GlobalResponderHandler = GlobalResponderHandler;
      },
      injectGlobalInteractionHandler: function(GlobalInteractionHandler) {
        ResponderEventPlugin.GlobalInteractionHandler = GlobalInteractionHandler;
      }
    }
  };
  module.exports = ResponderEventPlugin;
})(require("process"));
