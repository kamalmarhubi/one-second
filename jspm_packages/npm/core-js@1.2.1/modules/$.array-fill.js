/* */ 
'use strict';
var toObject = require("./$.to-object"),
    toIndex = require("./$.to-index"),
    toLength = require("./$.to-length");
module.exports = [].fill || function fill(value) {
  var O = toObject(this, true),
      length = toLength(O.length),
      index = toIndex(arguments[1], length),
      end = arguments[2],
      endPos = end === undefined ? length : toIndex(end, length);
  while (endPos > index)
    O[index++] = value;
  return O;
};
