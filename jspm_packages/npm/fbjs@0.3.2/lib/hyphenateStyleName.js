/* */ 
'use strict';
var hyphenate = require("./hyphenate");
var msPattern = /^ms-/;
function hyphenateStyleName(string) {
  return hyphenate(string).replace(msPattern, '-ms-');
}
module.exports = hyphenateStyleName;
