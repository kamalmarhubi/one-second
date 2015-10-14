/* */ 
(function(process) {
  "use strict";
  var rawAsap = require("./browser-raw");
  var freeTasks = [];
  module.exports = asap;
  function asap(task) {
    var rawTask;
    if (freeTasks.length) {
      rawTask = freeTasks.pop();
    } else {
      rawTask = new RawTask();
    }
    rawTask.task = task;
    rawTask.domain = process.domain;
    rawAsap(rawTask);
  }
  function RawTask() {
    this.task = null;
    this.domain = null;
  }
  RawTask.prototype.call = function() {
    if (this.domain) {
      this.domain.enter();
    }
    var threw = true;
    try {
      this.task.call();
      threw = false;
      if (this.domain) {
        this.domain.exit();
      }
    } finally {
      if (threw) {
        rawAsap.requestFlush();
      }
      this.task = null;
      this.domain = null;
      freeTasks.push(this);
    }
  };
})(require("process"));
