/* */ 
(function(process) {
  'use strict';
  var EventPluginUtils = require("./EventPluginUtils");
  var invariant = require("fbjs/lib/invariant");
  var isMoveish = EventPluginUtils.isMoveish;
  var isStartish = EventPluginUtils.isStartish;
  var isEndish = EventPluginUtils.isEndish;
  var MAX_TOUCH_BANK = 20;
  var touchHistory = {
    touchBank: [],
    numberActiveTouches: 0,
    indexOfSingleActiveTouch: -1,
    mostRecentTimeStamp: 0
  };
  var timestampForTouch = function(touch) {
    return touch.timeStamp || touch.timestamp;
  };
  var initializeTouchData = function(touch) {
    return {
      touchActive: true,
      startTimeStamp: timestampForTouch(touch),
      startPageX: touch.pageX,
      startPageY: touch.pageY,
      currentPageX: touch.pageX,
      currentPageY: touch.pageY,
      currentTimeStamp: timestampForTouch(touch),
      previousPageX: touch.pageX,
      previousPageY: touch.pageY,
      previousTimeStamp: timestampForTouch(touch)
    };
  };
  var reinitializeTouchTrack = function(touchTrack, touch) {
    touchTrack.touchActive = true;
    touchTrack.startTimeStamp = timestampForTouch(touch);
    touchTrack.startPageX = touch.pageX;
    touchTrack.startPageY = touch.pageY;
    touchTrack.currentPageX = touch.pageX;
    touchTrack.currentPageY = touch.pageY;
    touchTrack.currentTimeStamp = timestampForTouch(touch);
    touchTrack.previousPageX = touch.pageX;
    touchTrack.previousPageY = touch.pageY;
    touchTrack.previousTimeStamp = timestampForTouch(touch);
  };
  var validateTouch = function(touch) {
    var identifier = touch.identifier;
    !(identifier != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Touch object is missing identifier') : invariant(false) : undefined;
    if (identifier > MAX_TOUCH_BANK) {
      console.warn('Touch identifier ' + identifier + ' is greater than maximum ' + 'supported ' + MAX_TOUCH_BANK + ' which causes performance issues ' + 'backfilling array locations for all of the indices.');
    }
  };
  var recordStartTouchData = function(touch) {
    var touchBank = touchHistory.touchBank;
    var identifier = touch.identifier;
    var touchTrack = touchBank[identifier];
    if (process.env.NODE_ENV !== 'production') {
      validateTouch(touch);
    }
    if (touchTrack) {
      reinitializeTouchTrack(touchTrack, touch);
    } else {
      touchBank[touch.identifier] = initializeTouchData(touch);
    }
    touchHistory.mostRecentTimeStamp = timestampForTouch(touch);
  };
  var recordMoveTouchData = function(touch) {
    var touchBank = touchHistory.touchBank;
    var touchTrack = touchBank[touch.identifier];
    if (process.env.NODE_ENV !== 'production') {
      validateTouch(touch);
      !touchTrack ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Touch data should have been recorded on start') : invariant(false) : undefined;
    }
    touchTrack.touchActive = true;
    touchTrack.previousPageX = touchTrack.currentPageX;
    touchTrack.previousPageY = touchTrack.currentPageY;
    touchTrack.previousTimeStamp = touchTrack.currentTimeStamp;
    touchTrack.currentPageX = touch.pageX;
    touchTrack.currentPageY = touch.pageY;
    touchTrack.currentTimeStamp = timestampForTouch(touch);
    touchHistory.mostRecentTimeStamp = timestampForTouch(touch);
  };
  var recordEndTouchData = function(touch) {
    var touchBank = touchHistory.touchBank;
    var touchTrack = touchBank[touch.identifier];
    if (process.env.NODE_ENV !== 'production') {
      validateTouch(touch);
      !touchTrack ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Touch data should have been recorded on start') : invariant(false) : undefined;
    }
    touchTrack.previousPageX = touchTrack.currentPageX;
    touchTrack.previousPageY = touchTrack.currentPageY;
    touchTrack.previousTimeStamp = touchTrack.currentTimeStamp;
    touchTrack.currentPageX = touch.pageX;
    touchTrack.currentPageY = touch.pageY;
    touchTrack.currentTimeStamp = timestampForTouch(touch);
    touchTrack.touchActive = false;
    touchHistory.mostRecentTimeStamp = timestampForTouch(touch);
  };
  var ResponderTouchHistoryStore = {
    recordTouchTrack: function(topLevelType, nativeEvent) {
      var touchBank = touchHistory.touchBank;
      if (isMoveish(topLevelType)) {
        nativeEvent.changedTouches.forEach(recordMoveTouchData);
      } else if (isStartish(topLevelType)) {
        nativeEvent.changedTouches.forEach(recordStartTouchData);
        touchHistory.numberActiveTouches = nativeEvent.touches.length;
        if (touchHistory.numberActiveTouches === 1) {
          touchHistory.indexOfSingleActiveTouch = nativeEvent.touches[0].identifier;
        }
      } else if (isEndish(topLevelType)) {
        nativeEvent.changedTouches.forEach(recordEndTouchData);
        touchHistory.numberActiveTouches = nativeEvent.touches.length;
        if (touchHistory.numberActiveTouches === 1) {
          for (var i = 0; i < touchBank.length; i++) {
            var touchTrackToCheck = touchBank[i];
            if (touchTrackToCheck != null && touchTrackToCheck.touchActive) {
              touchHistory.indexOfSingleActiveTouch = i;
              break;
            }
          }
          if (process.env.NODE_ENV !== 'production') {
            var activeTouchData = touchBank[touchHistory.indexOfSingleActiveTouch];
            var foundActive = activeTouchData != null && !!activeTouchData.touchActive;
            !foundActive ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Cannot find single active touch') : invariant(false) : undefined;
          }
        }
      }
    },
    touchHistory: touchHistory
  };
  module.exports = ResponderTouchHistoryStore;
})(require("process"));
