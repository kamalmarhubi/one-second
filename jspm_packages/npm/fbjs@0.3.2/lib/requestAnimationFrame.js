/* */ 
'use strict';
var emptyFunction = require("./emptyFunction");
var nativeRequestAnimationFrame = require("./nativeRequestAnimationFrame");
var lastTime = 0;
var requestAnimationFrame = nativeRequestAnimationFrame || function(callback) {
  var currTime = Date.now();
  var timeDelay = Math.max(0, 16 - (currTime - lastTime));
  lastTime = currTime + timeDelay;
  return global.setTimeout(function() {
    callback(Date.now());
  }, timeDelay);
};
requestAnimationFrame(emptyFunction);
module.exports = requestAnimationFrame;
