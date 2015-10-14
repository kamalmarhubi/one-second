/* */ 
'use strict';
var escapeTextContentForBrowser = require("./escapeTextContentForBrowser");
function quoteAttributeValueForBrowser(value) {
  return '"' + escapeTextContentForBrowser(value) + '"';
}
module.exports = quoteAttributeValueForBrowser;
