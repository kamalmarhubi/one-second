/* */ 
(function(process) {
  'use strict';
  var ExecutionEnvironment = require("./ExecutionEnvironment");
  var createArrayFromMixed = require("./createArrayFromMixed");
  var getMarkupWrap = require("./getMarkupWrap");
  var invariant = require("./invariant");
  var dummyNode = ExecutionEnvironment.canUseDOM ? document.createElement('div') : null;
  var nodeNamePattern = /^\s*<(\w+)/;
  function getNodeName(markup) {
    var nodeNameMatch = markup.match(nodeNamePattern);
    return nodeNameMatch && nodeNameMatch[1].toLowerCase();
  }
  function createNodesFromMarkup(markup, handleScript) {
    var node = dummyNode;
    !!!dummyNode ? process.env.NODE_ENV !== 'production' ? invariant(false, 'createNodesFromMarkup dummy not initialized') : invariant(false) : undefined;
    var nodeName = getNodeName(markup);
    var wrap = nodeName && getMarkupWrap(nodeName);
    if (wrap) {
      node.innerHTML = wrap[1] + markup + wrap[2];
      var wrapDepth = wrap[0];
      while (wrapDepth--) {
        node = node.lastChild;
      }
    } else {
      node.innerHTML = markup;
    }
    var scripts = node.getElementsByTagName('script');
    if (scripts.length) {
      !handleScript ? process.env.NODE_ENV !== 'production' ? invariant(false, 'createNodesFromMarkup(...): Unexpected <script> element rendered.') : invariant(false) : undefined;
      createArrayFromMixed(scripts).forEach(handleScript);
    }
    var nodes = createArrayFromMixed(node.childNodes);
    while (node.lastChild) {
      node.removeChild(node.lastChild);
    }
    return nodes;
  }
  module.exports = createNodesFromMarkup;
})(require("process"));
