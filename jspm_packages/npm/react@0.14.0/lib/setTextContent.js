/* */ 
'use strict';
var ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");
var escapeTextContentForBrowser = require("./escapeTextContentForBrowser");
var setInnerHTML = require("./setInnerHTML");
var setTextContent = function(node, text) {
  node.textContent = text;
};
if (ExecutionEnvironment.canUseDOM) {
  if (!('textContent' in document.documentElement)) {
    setTextContent = function(node, text) {
      setInnerHTML(node, escapeTextContentForBrowser(text));
    };
  }
}
module.exports = setTextContent;
