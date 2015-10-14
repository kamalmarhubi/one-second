/* */ 
(function(process) {
  'use strict';
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function');
    }
  }
  var Deferred = require("./Deferred");
  var invariant = require("./invariant");
  var PromiseMap = (function() {
    function PromiseMap() {
      _classCallCheck(this, PromiseMap);
      this._deferred = {};
    }
    PromiseMap.prototype.get = function get(key) {
      return getDeferred(this._deferred, key).getPromise();
    };
    PromiseMap.prototype.resolveKey = function resolveKey(key, value) {
      var entry = getDeferred(this._deferred, key);
      !!entry.isSettled() ? process.env.NODE_ENV !== 'production' ? invariant(false, 'PromiseMap: Already settled `%s`.', key) : invariant(false) : undefined;
      entry.resolve(value);
    };
    PromiseMap.prototype.rejectKey = function rejectKey(key, reason) {
      var entry = getDeferred(this._deferred, key);
      !!entry.isSettled() ? process.env.NODE_ENV !== 'production' ? invariant(false, 'PromiseMap: Already settled `%s`.', key) : invariant(false) : undefined;
      entry.reject(reason);
    };
    return PromiseMap;
  })();
  function getDeferred(entries, key) {
    if (!entries.hasOwnProperty(key)) {
      entries[key] = new Deferred();
    }
    return entries[key];
  }
  module.exports = PromiseMap;
})(require("process"));
