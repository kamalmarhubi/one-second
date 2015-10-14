/* */ 
'use strict';
var camelize = require("./camelize");
var msPattern = /^-ms-/;
function camelizeStyleName(string) {
  return camelize(string.replace(msPattern, 'ms-'));
}
module.exports = camelizeStyleName;
