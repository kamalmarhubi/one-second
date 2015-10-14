/* */ 
'use strict';
var isNode = require("./isNode");
function isTextNode(object) {
  return isNode(object) && object.nodeType == 3;
}
module.exports = isTextNode;
