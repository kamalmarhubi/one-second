/* */ 
(function(process) {
  'use strict';
  var EventConstants = require("./EventConstants");
  var EventPluginHub = require("./EventPluginHub");
  var EventPropagators = require("./EventPropagators");
  var ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");
  var ReactUpdates = require("./ReactUpdates");
  var SyntheticEvent = require("./SyntheticEvent");
  var getEventTarget = require("./getEventTarget");
  var isEventSupported = require("./isEventSupported");
  var isTextInputElement = require("./isTextInputElement");
  var keyOf = require("fbjs/lib/keyOf");
  var topLevelTypes = EventConstants.topLevelTypes;
  var eventTypes = {change: {
      phasedRegistrationNames: {
        bubbled: keyOf({onChange: null}),
        captured: keyOf({onChangeCapture: null})
      },
      dependencies: [topLevelTypes.topBlur, topLevelTypes.topChange, topLevelTypes.topClick, topLevelTypes.topFocus, topLevelTypes.topInput, topLevelTypes.topKeyDown, topLevelTypes.topKeyUp, topLevelTypes.topSelectionChange]
    }};
  var activeElement = null;
  var activeElementID = null;
  var activeElementValue = null;
  var activeElementValueProp = null;
  function shouldUseChangeEvent(elem) {
    var nodeName = elem.nodeName && elem.nodeName.toLowerCase();
    return nodeName === 'select' || nodeName === 'input' && elem.type === 'file';
  }
  var doesChangeEventBubble = false;
  if (ExecutionEnvironment.canUseDOM) {
    doesChangeEventBubble = isEventSupported('change') && (!('documentMode' in document) || document.documentMode > 8);
  }
  function manualDispatchChangeEvent(nativeEvent) {
    var event = SyntheticEvent.getPooled(eventTypes.change, activeElementID, nativeEvent, getEventTarget(nativeEvent));
    EventPropagators.accumulateTwoPhaseDispatches(event);
    ReactUpdates.batchedUpdates(runEventInBatch, event);
  }
  function runEventInBatch(event) {
    EventPluginHub.enqueueEvents(event);
    EventPluginHub.processEventQueue(false);
  }
  function startWatchingForChangeEventIE8(target, targetID) {
    activeElement = target;
    activeElementID = targetID;
    activeElement.attachEvent('onchange', manualDispatchChangeEvent);
  }
  function stopWatchingForChangeEventIE8() {
    if (!activeElement) {
      return;
    }
    activeElement.detachEvent('onchange', manualDispatchChangeEvent);
    activeElement = null;
    activeElementID = null;
  }
  function getTargetIDForChangeEvent(topLevelType, topLevelTarget, topLevelTargetID) {
    if (topLevelType === topLevelTypes.topChange) {
      return topLevelTargetID;
    }
  }
  function handleEventsForChangeEventIE8(topLevelType, topLevelTarget, topLevelTargetID) {
    if (topLevelType === topLevelTypes.topFocus) {
      stopWatchingForChangeEventIE8();
      startWatchingForChangeEventIE8(topLevelTarget, topLevelTargetID);
    } else if (topLevelType === topLevelTypes.topBlur) {
      stopWatchingForChangeEventIE8();
    }
  }
  var isInputEventSupported = false;
  if (ExecutionEnvironment.canUseDOM) {
    isInputEventSupported = isEventSupported('input') && (!('documentMode' in document) || document.documentMode > 9);
  }
  var newValueProp = {
    get: function() {
      return activeElementValueProp.get.call(this);
    },
    set: function(val) {
      activeElementValue = '' + val;
      activeElementValueProp.set.call(this, val);
    }
  };
  function startWatchingForValueChange(target, targetID) {
    activeElement = target;
    activeElementID = targetID;
    activeElementValue = target.value;
    activeElementValueProp = Object.getOwnPropertyDescriptor(target.constructor.prototype, 'value');
    Object.defineProperty(activeElement, 'value', newValueProp);
    activeElement.attachEvent('onpropertychange', handlePropertyChange);
  }
  function stopWatchingForValueChange() {
    if (!activeElement) {
      return;
    }
    delete activeElement.value;
    activeElement.detachEvent('onpropertychange', handlePropertyChange);
    activeElement = null;
    activeElementID = null;
    activeElementValue = null;
    activeElementValueProp = null;
  }
  function handlePropertyChange(nativeEvent) {
    if (nativeEvent.propertyName !== 'value') {
      return;
    }
    var value = nativeEvent.srcElement.value;
    if (value === activeElementValue) {
      return;
    }
    activeElementValue = value;
    manualDispatchChangeEvent(nativeEvent);
  }
  function getTargetIDForInputEvent(topLevelType, topLevelTarget, topLevelTargetID) {
    if (topLevelType === topLevelTypes.topInput) {
      return topLevelTargetID;
    }
  }
  function handleEventsForInputEventIE(topLevelType, topLevelTarget, topLevelTargetID) {
    if (topLevelType === topLevelTypes.topFocus) {
      stopWatchingForValueChange();
      startWatchingForValueChange(topLevelTarget, topLevelTargetID);
    } else if (topLevelType === topLevelTypes.topBlur) {
      stopWatchingForValueChange();
    }
  }
  function getTargetIDForInputEventIE(topLevelType, topLevelTarget, topLevelTargetID) {
    if (topLevelType === topLevelTypes.topSelectionChange || topLevelType === topLevelTypes.topKeyUp || topLevelType === topLevelTypes.topKeyDown) {
      if (activeElement && activeElement.value !== activeElementValue) {
        activeElementValue = activeElement.value;
        return activeElementID;
      }
    }
  }
  function shouldUseClickEvent(elem) {
    return elem.nodeName && elem.nodeName.toLowerCase() === 'input' && (elem.type === 'checkbox' || elem.type === 'radio');
  }
  function getTargetIDForClickEvent(topLevelType, topLevelTarget, topLevelTargetID) {
    if (topLevelType === topLevelTypes.topClick) {
      return topLevelTargetID;
    }
  }
  var ChangeEventPlugin = {
    eventTypes: eventTypes,
    extractEvents: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
      var getTargetIDFunc,
          handleEventFunc;
      if (shouldUseChangeEvent(topLevelTarget)) {
        if (doesChangeEventBubble) {
          getTargetIDFunc = getTargetIDForChangeEvent;
        } else {
          handleEventFunc = handleEventsForChangeEventIE8;
        }
      } else if (isTextInputElement(topLevelTarget)) {
        if (isInputEventSupported) {
          getTargetIDFunc = getTargetIDForInputEvent;
        } else {
          getTargetIDFunc = getTargetIDForInputEventIE;
          handleEventFunc = handleEventsForInputEventIE;
        }
      } else if (shouldUseClickEvent(topLevelTarget)) {
        getTargetIDFunc = getTargetIDForClickEvent;
      }
      if (getTargetIDFunc) {
        var targetID = getTargetIDFunc(topLevelType, topLevelTarget, topLevelTargetID);
        if (targetID) {
          var event = SyntheticEvent.getPooled(eventTypes.change, targetID, nativeEvent, nativeEventTarget);
          event.type = 'change';
          EventPropagators.accumulateTwoPhaseDispatches(event);
          return event;
        }
      }
      if (handleEventFunc) {
        handleEventFunc(topLevelType, topLevelTarget, topLevelTargetID);
      }
    }
  };
  module.exports = ChangeEventPlugin;
})(require("process"));
