/* */ 
(function(process) {
  'use strict';
  Object.defineProperty(exports, '__esModule', {value: true});
  function _objectWithoutProperties(obj, keys) {
    var target = {};
    for (var i in obj) {
      if (keys.indexOf(i) >= 0)
        continue;
      if (!Object.prototype.hasOwnProperty.call(obj, i))
        continue;
      target[i] = obj[i];
    }
    return target;
  }
  var ExecutionEnvironment = require("./ExecutionEnvironment");
  var Promise = require("./Promise");
  var sprintf = require("./sprintf");
  var fetch = require("./fetch");
  var warning = require("./warning");
  var DEFAULT_TIMEOUT = 15000;
  var DEFAULT_RETRIES = [1000, 3000];
  function fetchWithRetries(uri, initWithRetries) {
    var _ref = initWithRetries || {};
    var fetchTimeout = _ref.fetchTimeout;
    var retryDelays = _ref.retryDelays;
    var init = _objectWithoutProperties(_ref, ['fetchTimeout', 'retryDelays']);
    var _fetchTimeout = fetchTimeout != null ? fetchTimeout : DEFAULT_TIMEOUT;
    var _retryDelays = retryDelays != null ? retryDelays : DEFAULT_RETRIES;
    var requestsAttempted = 0;
    var requestStartTime = 0;
    return new Promise(function(resolve, reject) {
      function sendTimedRequest() {
        requestsAttempted++;
        requestStartTime = Date.now();
        var isRequestAlive = true;
        var request = fetch(uri, init);
        var requestTimeout = setTimeout(function() {
          isRequestAlive = false;
          if (shouldRetry(requestsAttempted)) {
            process.env.NODE_ENV !== 'production' ? warning(false, 'fetchWithRetries: HTTP timeout, retrying.') : undefined;
            retryRequest();
          } else {
            reject(new Error(sprintf('fetchWithRetries(): Failed to get response from server, ' + 'tried %s times.', requestsAttempted)));
          }
        }, _fetchTimeout);
        request.then(function(response) {
          clearTimeout(requestTimeout);
          if (isRequestAlive) {
            if (response.status >= 200 && response.status < 300) {
              resolve(response);
            } else if (shouldRetry(requestsAttempted)) {
              process.env.NODE_ENV !== 'production' ? process.env.NODE_ENV !== 'production' ? warning(false, 'fetchWithRetries: HTTP error, retrying.') : undefined : undefined, retryRequest();
            } else {
              var error = new Error(sprintf('fetchWithRetries(): Still no successful response after ' + '%s retries, giving up.', requestsAttempted));
              error.response = response;
              reject(error);
            }
          }
        })['catch'](function(error) {
          clearTimeout(requestTimeout);
          if (shouldRetry(requestsAttempted)) {
            retryRequest();
          } else {
            reject(error);
          }
        });
      }
      function retryRequest() {
        var retryDelay = _retryDelays[requestsAttempted - 1];
        var retryStartTime = requestStartTime + retryDelay;
        setTimeout(sendTimedRequest, retryStartTime - Date.now());
      }
      function shouldRetry(attempt) {
        return ExecutionEnvironment.canUseDOM && attempt <= _retryDelays.length;
      }
      sendTimedRequest();
    });
  }
  module.exports = fetchWithRetries;
})(require("process"));
