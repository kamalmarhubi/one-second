/* */ 
'use strict';
var assign = require("./Object.assign");
var emptyFunction = require("fbjs/lib/emptyFunction");
var joinClasses = require("fbjs/lib/joinClasses");
function createTransferStrategy(mergeStrategy) {
  return function(props, key, value) {
    if (!props.hasOwnProperty(key)) {
      props[key] = value;
    } else {
      props[key] = mergeStrategy(props[key], value);
    }
  };
}
var transferStrategyMerge = createTransferStrategy(function(a, b) {
  return assign({}, b, a);
});
var TransferStrategies = {
  children: emptyFunction,
  className: createTransferStrategy(joinClasses),
  style: transferStrategyMerge
};
function transferInto(props, newProps) {
  for (var thisKey in newProps) {
    if (!newProps.hasOwnProperty(thisKey)) {
      continue;
    }
    var transferStrategy = TransferStrategies[thisKey];
    if (transferStrategy && TransferStrategies.hasOwnProperty(thisKey)) {
      transferStrategy(props, thisKey, newProps[thisKey]);
    } else if (!props.hasOwnProperty(thisKey)) {
      props[thisKey] = newProps[thisKey];
    }
  }
  return props;
}
var ReactPropTransferer = {mergeProps: function(oldProps, newProps) {
    return transferInto(assign({}, oldProps), newProps);
  }};
module.exports = ReactPropTransferer;
