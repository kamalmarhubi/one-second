/* */ 
(function(process) {
  'use strict';
  var ExecutionEnvironment = require("fbjs/lib/ExecutionEnvironment");
  var createNodesFromMarkup = require("fbjs/lib/createNodesFromMarkup");
  var emptyFunction = require("fbjs/lib/emptyFunction");
  var getMarkupWrap = require("fbjs/lib/getMarkupWrap");
  var invariant = require("fbjs/lib/invariant");
  var OPEN_TAG_NAME_EXP = /^(<[^ \/>]+)/;
  var RESULT_INDEX_ATTR = 'data-danger-index';
  function getNodeName(markup) {
    return markup.substring(1, markup.indexOf(' '));
  }
  var Danger = {
    dangerouslyRenderMarkup: function(markupList) {
      !ExecutionEnvironment.canUseDOM ? process.env.NODE_ENV !== 'production' ? invariant(false, 'dangerouslyRenderMarkup(...): Cannot render markup in a worker ' + 'thread. Make sure `window` and `document` are available globally ' + 'before requiring React when unit testing or use ' + 'ReactDOMServer.renderToString for server rendering.') : invariant(false) : undefined;
      var nodeName;
      var markupByNodeName = {};
      for (var i = 0; i < markupList.length; i++) {
        !markupList[i] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'dangerouslyRenderMarkup(...): Missing markup.') : invariant(false) : undefined;
        nodeName = getNodeName(markupList[i]);
        nodeName = getMarkupWrap(nodeName) ? nodeName : '*';
        markupByNodeName[nodeName] = markupByNodeName[nodeName] || [];
        markupByNodeName[nodeName][i] = markupList[i];
      }
      var resultList = [];
      var resultListAssignmentCount = 0;
      for (nodeName in markupByNodeName) {
        if (!markupByNodeName.hasOwnProperty(nodeName)) {
          continue;
        }
        var markupListByNodeName = markupByNodeName[nodeName];
        var resultIndex;
        for (resultIndex in markupListByNodeName) {
          if (markupListByNodeName.hasOwnProperty(resultIndex)) {
            var markup = markupListByNodeName[resultIndex];
            markupListByNodeName[resultIndex] = markup.replace(OPEN_TAG_NAME_EXP, '$1 ' + RESULT_INDEX_ATTR + '="' + resultIndex + '" ');
          }
        }
        var renderNodes = createNodesFromMarkup(markupListByNodeName.join(''), emptyFunction);
        for (var j = 0; j < renderNodes.length; ++j) {
          var renderNode = renderNodes[j];
          if (renderNode.hasAttribute && renderNode.hasAttribute(RESULT_INDEX_ATTR)) {
            resultIndex = +renderNode.getAttribute(RESULT_INDEX_ATTR);
            renderNode.removeAttribute(RESULT_INDEX_ATTR);
            !!resultList.hasOwnProperty(resultIndex) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Danger: Assigning to an already-occupied result index.') : invariant(false) : undefined;
            resultList[resultIndex] = renderNode;
            resultListAssignmentCount += 1;
          } else if (process.env.NODE_ENV !== 'production') {
            console.error('Danger: Discarding unexpected node:', renderNode);
          }
        }
      }
      !(resultListAssignmentCount === resultList.length) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Danger: Did not assign to every index of resultList.') : invariant(false) : undefined;
      !(resultList.length === markupList.length) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Danger: Expected markup to render %s nodes, but rendered %s.', markupList.length, resultList.length) : invariant(false) : undefined;
      return resultList;
    },
    dangerouslyReplaceNodeWithMarkup: function(oldChild, markup) {
      !ExecutionEnvironment.canUseDOM ? process.env.NODE_ENV !== 'production' ? invariant(false, 'dangerouslyReplaceNodeWithMarkup(...): Cannot render markup in a ' + 'worker thread. Make sure `window` and `document` are available ' + 'globally before requiring React when unit testing or use ' + 'ReactDOMServer.renderToString() for server rendering.') : invariant(false) : undefined;
      !markup ? process.env.NODE_ENV !== 'production' ? invariant(false, 'dangerouslyReplaceNodeWithMarkup(...): Missing markup.') : invariant(false) : undefined;
      !(oldChild.tagName.toLowerCase() !== 'html') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'dangerouslyReplaceNodeWithMarkup(...): Cannot replace markup of the ' + '<html> node. This is because browser quirks make this unreliable ' + 'and/or slow. If you want to render to the root you must use ' + 'server rendering. See ReactDOMServer.renderToString().') : invariant(false) : undefined;
      var newChild;
      if (typeof markup === 'string') {
        newChild = createNodesFromMarkup(markup, emptyFunction)[0];
      } else {
        newChild = markup;
      }
      oldChild.parentNode.replaceChild(newChild, oldChild);
    }
  };
  module.exports = Danger;
})(require("process"));
