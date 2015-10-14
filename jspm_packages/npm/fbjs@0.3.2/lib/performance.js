/* */ 
'use strict';
var ExecutionEnvironment = require("./ExecutionEnvironment");
var performance;
if (ExecutionEnvironment.canUseDOM) {
  performance = window.performance || window.msPerformance || window.webkitPerformance;
}
module.exports = performance || {};
