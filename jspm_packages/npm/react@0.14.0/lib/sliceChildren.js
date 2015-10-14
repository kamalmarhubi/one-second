/* */ 
'use strict';
var ReactChildren = require("./ReactChildren");
function sliceChildren(children, start, end) {
  if (children == null) {
    return children;
  }
  var array = ReactChildren.toArray(children);
  return array.slice(start, end);
}
module.exports = sliceChildren;
