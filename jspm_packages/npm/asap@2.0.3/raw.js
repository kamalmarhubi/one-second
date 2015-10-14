/* */ 
(function(process) {
  "use strict";
  var domain;
  var hasSetImmediate = typeof setImmediate === "function";
  module.exports = rawAsap;
  function rawAsap(task) {
    if (!queue.length) {
      requestFlush();
      flushing = true;
    }
    queue[queue.length] = task;
  }
  var queue = [];
  var flushing = false;
  var index = 0;
  var capacity = 1024;
  function flush() {
    while (index < queue.length) {
      var currentIndex = index;
      index = index + 1;
      queue[currentIndex].call();
      if (index > capacity) {
        for (var scan = 0,
            newLength = queue.length - index; scan < newLength; scan++) {
          queue[scan] = queue[scan + index];
        }
        queue.length -= index;
        index = 0;
      }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
  }
  rawAsap.requestFlush = requestFlush;
  function requestFlush() {
    var parentDomain = process.domain;
    if (parentDomain) {
      if (!domain) {
        domain = require("domain");
      }
      domain.active = process.domain = null;
    }
    if (flushing && hasSetImmediate) {
      setImmediate(flush);
    } else {
      process.nextTick(flush);
    }
    if (parentDomain) {
      domain.active = process.domain = parentDomain;
    }
  }
})(require("process"));
