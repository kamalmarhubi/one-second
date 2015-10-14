/* */ 
'use strict';
var isTextNode = require("./isTextNode");
function containsNode(_x, _x2) {
  var _again = true;
  _function: while (_again) {
    var outerNode = _x,
        innerNode = _x2;
    _again = false;
    if (!outerNode || !innerNode) {
      return false;
    } else if (outerNode === innerNode) {
      return true;
    } else if (isTextNode(outerNode)) {
      return false;
    } else if (isTextNode(innerNode)) {
      _x = outerNode;
      _x2 = innerNode.parentNode;
      _again = true;
      continue _function;
    } else if (outerNode.contains) {
      return outerNode.contains(innerNode);
    } else if (outerNode.compareDocumentPosition) {
      return !!(outerNode.compareDocumentPosition(innerNode) & 16);
    } else {
      return false;
    }
  }
}
module.exports = containsNode;
