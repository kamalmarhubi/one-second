/* */ 
'use strict';
var performance = require("./performance");
var curPerformance = performance;
if (!curPerformance || !curPerformance.now) {
  curPerformance = Date;
}
var performanceNow = curPerformance.now.bind(curPerformance);
module.exports = performanceNow;
