/* */ 
(function(process) {
  'use strict';
  var ExecutionEnvironment = require("./ExecutionEnvironment");
  var invariant = require("./invariant");
  var dummyNode = ExecutionEnvironment.canUseDOM ? document.createElement('div') : null;
  var shouldWrap = {};
  var selectWrap = [1, '<select multiple="true">', '</select>'];
  var tableWrap = [1, '<table>', '</table>'];
  var trWrap = [3, '<table><tbody><tr>', '</tr></tbody></table>'];
  var svgWrap = [1, '<svg xmlns="http://www.w3.org/2000/svg">', '</svg>'];
  var markupWrap = {
    '*': [1, '?<div>', '</div>'],
    'area': [1, '<map>', '</map>'],
    'col': [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
    'legend': [1, '<fieldset>', '</fieldset>'],
    'param': [1, '<object>', '</object>'],
    'tr': [2, '<table><tbody>', '</tbody></table>'],
    'optgroup': selectWrap,
    'option': selectWrap,
    'caption': tableWrap,
    'colgroup': tableWrap,
    'tbody': tableWrap,
    'tfoot': tableWrap,
    'thead': tableWrap,
    'td': trWrap,
    'th': trWrap
  };
  var svgElements = ['circle', 'clipPath', 'defs', 'ellipse', 'g', 'image', 'line', 'linearGradient', 'mask', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'stop', 'text', 'tspan'];
  svgElements.forEach(function(nodeName) {
    markupWrap[nodeName] = svgWrap;
    shouldWrap[nodeName] = true;
  });
  function getMarkupWrap(nodeName) {
    !!!dummyNode ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Markup wrapping node not initialized') : invariant(false) : undefined;
    if (!markupWrap.hasOwnProperty(nodeName)) {
      nodeName = '*';
    }
    if (!shouldWrap.hasOwnProperty(nodeName)) {
      if (nodeName === '*') {
        dummyNode.innerHTML = '<link />';
      } else {
        dummyNode.innerHTML = '<' + nodeName + '></' + nodeName + '>';
      }
      shouldWrap[nodeName] = !dummyNode.firstChild;
    }
    return shouldWrap[nodeName] ? markupWrap[nodeName] : null;
  }
  module.exports = getMarkupWrap;
})(require("process"));
