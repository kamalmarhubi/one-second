/* */ 
(function(process) {
  "use strict";
  var rawAsap = require("./browser-raw");
  var freeTasks = [];
  var pendingErrors = [];
  var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);
  function throwFirstError() {
    if (pendingErrors.length) {
      throw pendingErrors.shift();
    }
  }
  module.exports = asap;
  function asap(task) {
    var rawTask;
    if (freeTasks.length) {
      rawTask = freeTasks.pop();
    } else {
      rawTask = new RawTask();
    }
    rawTask.task = task;
    rawAsap(rawTask);
  }
  function RawTask() {
    this.task = null;
  }
  RawTask.prototype.call = function() {
    try {
      this.task.call();
    } catch (error) {
      if (asap.onerror) {
        asap.onerror(error);
      } else {
        pendingErrors.push(error);
        requestErrorThrow();
      }
    } finally {
      this.task = null;
      freeTasks[freeTasks.length] = this;
    }
  };
})(require("process"));
