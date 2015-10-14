/* */ 
'use strict';
var assign = require("./Object.assign");
var DONT_CARE_THRESHOLD = 1.2;
var DOM_OPERATION_TYPES = {
  '_mountImageIntoNode': 'set innerHTML',
  INSERT_MARKUP: 'set innerHTML',
  MOVE_EXISTING: 'move',
  REMOVE_NODE: 'remove',
  SET_MARKUP: 'set innerHTML',
  TEXT_CONTENT: 'set textContent',
  'setValueForProperty': 'update attribute',
  'setValueForAttribute': 'update attribute',
  'deleteValueForProperty': 'remove attribute',
  'dangerouslyReplaceNodeWithMarkupByID': 'replace'
};
function getTotalTime(measurements) {
  var totalTime = 0;
  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    totalTime += measurement.totalTime;
  }
  return totalTime;
}
function getDOMSummary(measurements) {
  var items = [];
  measurements.forEach(function(measurement) {
    Object.keys(measurement.writes).forEach(function(id) {
      measurement.writes[id].forEach(function(write) {
        items.push({
          id: id,
          type: DOM_OPERATION_TYPES[write.type] || write.type,
          args: write.args
        });
      });
    });
  });
  return items;
}
function getExclusiveSummary(measurements) {
  var candidates = {};
  var displayName;
  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var allIDs = assign({}, measurement.exclusive, measurement.inclusive);
    for (var id in allIDs) {
      displayName = measurement.displayNames[id].current;
      candidates[displayName] = candidates[displayName] || {
        componentName: displayName,
        inclusive: 0,
        exclusive: 0,
        render: 0,
        count: 0
      };
      if (measurement.render[id]) {
        candidates[displayName].render += measurement.render[id];
      }
      if (measurement.exclusive[id]) {
        candidates[displayName].exclusive += measurement.exclusive[id];
      }
      if (measurement.inclusive[id]) {
        candidates[displayName].inclusive += measurement.inclusive[id];
      }
      if (measurement.counts[id]) {
        candidates[displayName].count += measurement.counts[id];
      }
    }
  }
  var arr = [];
  for (displayName in candidates) {
    if (candidates[displayName].exclusive >= DONT_CARE_THRESHOLD) {
      arr.push(candidates[displayName]);
    }
  }
  arr.sort(function(a, b) {
    return b.exclusive - a.exclusive;
  });
  return arr;
}
function getInclusiveSummary(measurements, onlyClean) {
  var candidates = {};
  var inclusiveKey;
  for (var i = 0; i < measurements.length; i++) {
    var measurement = measurements[i];
    var allIDs = assign({}, measurement.exclusive, measurement.inclusive);
    var cleanComponents;
    if (onlyClean) {
      cleanComponents = getUnchangedComponents(measurement);
    }
    for (var id in allIDs) {
      if (onlyClean && !cleanComponents[id]) {
        continue;
      }
      var displayName = measurement.displayNames[id];
      inclusiveKey = displayName.owner + ' > ' + displayName.current;
      candidates[inclusiveKey] = candidates[inclusiveKey] || {
        componentName: inclusiveKey,
        time: 0,
        count: 0
      };
      if (measurement.inclusive[id]) {
        candidates[inclusiveKey].time += measurement.inclusive[id];
      }
      if (measurement.counts[id]) {
        candidates[inclusiveKey].count += measurement.counts[id];
      }
    }
  }
  var arr = [];
  for (inclusiveKey in candidates) {
    if (candidates[inclusiveKey].time >= DONT_CARE_THRESHOLD) {
      arr.push(candidates[inclusiveKey]);
    }
  }
  arr.sort(function(a, b) {
    return b.time - a.time;
  });
  return arr;
}
function getUnchangedComponents(measurement) {
  var cleanComponents = {};
  var dirtyLeafIDs = Object.keys(measurement.writes);
  var allIDs = assign({}, measurement.exclusive, measurement.inclusive);
  for (var id in allIDs) {
    var isDirty = false;
    for (var i = 0; i < dirtyLeafIDs.length; i++) {
      if (dirtyLeafIDs[i].indexOf(id) === 0) {
        isDirty = true;
        break;
      }
    }
    if (measurement.created[id]) {
      isDirty = true;
    }
    if (!isDirty && measurement.counts[id] > 0) {
      cleanComponents[id] = true;
    }
  }
  return cleanComponents;
}
var ReactDefaultPerfAnalysis = {
  getExclusiveSummary: getExclusiveSummary,
  getInclusiveSummary: getInclusiveSummary,
  getDOMSummary: getDOMSummary,
  getTotalTime: getTotalTime
};
module.exports = ReactDefaultPerfAnalysis;
