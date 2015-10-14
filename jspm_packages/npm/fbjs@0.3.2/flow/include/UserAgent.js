/* */ 
(function(process) {
  'use strict';
  var UserAgentData = require("UserAgentData");
  var VersionRange = require("VersionRange");
  var mapObject = require("mapObject");
  var memoizeStringOnly = require("memoizeStringOnly");
  function compare(name, version, query, normalizer) {
    if (name === query) {
      return true;
    }
    if (!query.startsWith(name)) {
      return false;
    }
    var range = query.slice(name.length);
    if (version) {
      range = normalizer ? normalizer(range) : range;
      return VersionRange.contains(range, version);
    }
    return false;
  }
  function normalizePlatformVersion(version) {
    if (UserAgentData.platformName === 'Windows') {
      return version.replace(/^\s*NT/, '');
    }
    return version;
  }
  var UserAgent = {
    isBrowser(query) {
      return compare(UserAgentData.browserName, UserAgentData.browserFullVersion, query);
    },
    isBrowserArchitecture(query) {
      return compare(UserAgentData.browserArchitecture, null, query);
    },
    isDevice(query) {
      return compare(UserAgentData.deviceName, null, query);
    },
    isEngine(query) {
      return compare(UserAgentData.engineName, UserAgentData.engineVersion, query);
    },
    isPlatform(query) {
      return compare(UserAgentData.platformName, UserAgentData.platformFullVersion, query, normalizePlatformVersion);
    },
    isPlatformArchitecture(query) {
      return compare(UserAgentData.platformArchitecture, null, query);
    }
  };
  module.exports = mapObject(UserAgent, memoizeStringOnly);
})(require("process"));
