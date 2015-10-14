/* */ 
'use strict';
var EventConstants = require("./EventConstants");
var EventPropagators = require("./EventPropagators");
var ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");
var ReactInputSelection = require("./ReactInputSelection");
var SyntheticEvent = require("./SyntheticEvent");
var getActiveElement = require("fbjs/lib/getActiveElement");
var isTextInputElement = require("./isTextInputElement");
var keyOf = require("fbjs/lib/keyOf");
var shallowEqual = require("fbjs/lib/shallowEqual");
var topLevelTypes = EventConstants.topLevelTypes;
var skipSelectionChangeEvent = ExecutionEnvironment.canUseDOM && 'documentMode' in document && document.documentMode <= 11;
var eventTypes = {select: {
    phasedRegistrationNames: {
      bubbled: keyOf({onSelect: null}),
      captured: keyOf({onSelectCapture: null})
    },
    dependencies: [topLevelTypes.topBlur, topLevelTypes.topContextMenu, topLevelTypes.topFocus, topLevelTypes.topKeyDown, topLevelTypes.topMouseDown, topLevelTypes.topMouseUp, topLevelTypes.topSelectionChange]
  }};
var activeElement = null;
var activeElementID = null;
var lastSelection = null;
var mouseDown = false;
var hasListener = false;
var ON_SELECT_KEY = keyOf({onSelect: null});
function getSelection(node) {
  if ('selectionStart' in node && ReactInputSelection.hasSelectionCapabilities(node)) {
    return {
      start: node.selectionStart,
      end: node.selectionEnd
    };
  } else if (window.getSelection) {
    var selection = window.getSelection();
    return {
      anchorNode: selection.anchorNode,
      anchorOffset: selection.anchorOffset,
      focusNode: selection.focusNode,
      focusOffset: selection.focusOffset
    };
  } else if (document.selection) {
    var range = document.selection.createRange();
    return {
      parentElement: range.parentElement(),
      text: range.text,
      top: range.boundingTop,
      left: range.boundingLeft
    };
  }
}
function constructSelectEvent(nativeEvent, nativeEventTarget) {
  if (mouseDown || activeElement == null || activeElement !== getActiveElement()) {
    return null;
  }
  var currentSelection = getSelection(activeElement);
  if (!lastSelection || !shallowEqual(lastSelection, currentSelection)) {
    lastSelection = currentSelection;
    var syntheticEvent = SyntheticEvent.getPooled(eventTypes.select, activeElementID, nativeEvent, nativeEventTarget);
    syntheticEvent.type = 'select';
    syntheticEvent.target = activeElement;
    EventPropagators.accumulateTwoPhaseDispatches(syntheticEvent);
    return syntheticEvent;
  }
  return null;
}
var SelectEventPlugin = {
  eventTypes: eventTypes,
  extractEvents: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent, nativeEventTarget) {
    if (!hasListener) {
      return null;
    }
    switch (topLevelType) {
      case topLevelTypes.topFocus:
        if (isTextInputElement(topLevelTarget) || topLevelTarget.contentEditable === 'true') {
          activeElement = topLevelTarget;
          activeElementID = topLevelTargetID;
          lastSelection = null;
        }
        break;
      case topLevelTypes.topBlur:
        activeElement = null;
        activeElementID = null;
        lastSelection = null;
        break;
      case topLevelTypes.topMouseDown:
        mouseDown = true;
        break;
      case topLevelTypes.topContextMenu:
      case topLevelTypes.topMouseUp:
        mouseDown = false;
        return constructSelectEvent(nativeEvent, nativeEventTarget);
      case topLevelTypes.topSelectionChange:
        if (skipSelectionChangeEvent) {
          break;
        }
      case topLevelTypes.topKeyDown:
      case topLevelTypes.topKeyUp:
        return constructSelectEvent(nativeEvent, nativeEventTarget);
    }
    return null;
  },
  didPutListener: function(id, registrationName, listener) {
    if (registrationName === ON_SELECT_KEY) {
      hasListener = true;
    }
  }
};
module.exports = SelectEventPlugin;
