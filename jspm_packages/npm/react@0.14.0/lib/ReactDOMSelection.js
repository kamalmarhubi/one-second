/* */ 
'use strict';
var ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");
var getNodeForCharacterOffset = require("./getNodeForCharacterOffset");
var getTextContentAccessor = require("./getTextContentAccessor");
function isCollapsed(anchorNode, anchorOffset, focusNode, focusOffset) {
  return anchorNode === focusNode && anchorOffset === focusOffset;
}
function getIEOffsets(node) {
  var selection = document.selection;
  var selectedRange = selection.createRange();
  var selectedLength = selectedRange.text.length;
  var fromStart = selectedRange.duplicate();
  fromStart.moveToElementText(node);
  fromStart.setEndPoint('EndToStart', selectedRange);
  var startOffset = fromStart.text.length;
  var endOffset = startOffset + selectedLength;
  return {
    start: startOffset,
    end: endOffset
  };
}
function getModernOffsets(node) {
  var selection = window.getSelection && window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  var anchorNode = selection.anchorNode;
  var anchorOffset = selection.anchorOffset;
  var focusNode = selection.focusNode;
  var focusOffset = selection.focusOffset;
  var currentRange = selection.getRangeAt(0);
  try {
    currentRange.startContainer.nodeType;
    currentRange.endContainer.nodeType;
  } catch (e) {
    return null;
  }
  var isSelectionCollapsed = isCollapsed(selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset);
  var rangeLength = isSelectionCollapsed ? 0 : currentRange.toString().length;
  var tempRange = currentRange.cloneRange();
  tempRange.selectNodeContents(node);
  tempRange.setEnd(currentRange.startContainer, currentRange.startOffset);
  var isTempRangeCollapsed = isCollapsed(tempRange.startContainer, tempRange.startOffset, tempRange.endContainer, tempRange.endOffset);
  var start = isTempRangeCollapsed ? 0 : tempRange.toString().length;
  var end = start + rangeLength;
  var detectionRange = document.createRange();
  detectionRange.setStart(anchorNode, anchorOffset);
  detectionRange.setEnd(focusNode, focusOffset);
  var isBackward = detectionRange.collapsed;
  return {
    start: isBackward ? end : start,
    end: isBackward ? start : end
  };
}
function setIEOffsets(node, offsets) {
  var range = document.selection.createRange().duplicate();
  var start,
      end;
  if (typeof offsets.end === 'undefined') {
    start = offsets.start;
    end = start;
  } else if (offsets.start > offsets.end) {
    start = offsets.end;
    end = offsets.start;
  } else {
    start = offsets.start;
    end = offsets.end;
  }
  range.moveToElementText(node);
  range.moveStart('character', start);
  range.setEndPoint('EndToStart', range);
  range.moveEnd('character', end - start);
  range.select();
}
function setModernOffsets(node, offsets) {
  if (!window.getSelection) {
    return;
  }
  var selection = window.getSelection();
  var length = node[getTextContentAccessor()].length;
  var start = Math.min(offsets.start, length);
  var end = typeof offsets.end === 'undefined' ? start : Math.min(offsets.end, length);
  if (!selection.extend && start > end) {
    var temp = end;
    end = start;
    start = temp;
  }
  var startMarker = getNodeForCharacterOffset(node, start);
  var endMarker = getNodeForCharacterOffset(node, end);
  if (startMarker && endMarker) {
    var range = document.createRange();
    range.setStart(startMarker.node, startMarker.offset);
    selection.removeAllRanges();
    if (start > end) {
      selection.addRange(range);
      selection.extend(endMarker.node, endMarker.offset);
    } else {
      range.setEnd(endMarker.node, endMarker.offset);
      selection.addRange(range);
    }
  }
}
var useIEOffsets = ExecutionEnvironment.canUseDOM && 'selection' in document && !('getSelection' in window);
var ReactDOMSelection = {
  getOffsets: useIEOffsets ? getIEOffsets : getModernOffsets,
  setOffsets: useIEOffsets ? setIEOffsets : setModernOffsets
};
module.exports = ReactDOMSelection;
