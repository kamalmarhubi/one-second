/* */ 
'use strict';
var Syntax = require("esprima-fb").Syntax;
var utils = require("../src/utils");
function visitTemplateLiteral(traverse, node, path, state) {
  var templateElements = node.quasis;
  utils.append('(', state);
  for (var ii = 0; ii < templateElements.length; ii++) {
    var templateElement = templateElements[ii];
    if (templateElement.value.raw !== '') {
      utils.append(getCookedValue(templateElement), state);
      if (!templateElement.tail) {
        utils.append(' + ', state);
      }
      utils.move(templateElement.range[0], state);
      utils.catchupNewlines(templateElement.range[1], state);
    } else {
      if (ii > 0 && !templateElement.tail) {
        utils.append(' + ', state);
      }
    }
    utils.move(templateElement.range[1], state);
    if (!templateElement.tail) {
      var substitution = node.expressions[ii];
      if (substitution.type === Syntax.Identifier || substitution.type === Syntax.MemberExpression || substitution.type === Syntax.CallExpression) {
        utils.catchup(substitution.range[1], state);
      } else {
        utils.append('(', state);
        traverse(substitution, path, state);
        utils.catchup(substitution.range[1], state);
        utils.append(')', state);
      }
      if (templateElements[ii + 1].value.cooked !== '') {
        utils.append(' + ', state);
      }
    }
  }
  utils.move(node.range[1], state);
  utils.append(')', state);
  return false;
}
visitTemplateLiteral.test = function(node, path, state) {
  return node.type === Syntax.TemplateLiteral;
};
function visitTaggedTemplateExpression(traverse, node, path, state) {
  var template = node.quasi;
  var numQuasis = template.quasis.length;
  utils.move(node.tag.range[0], state);
  traverse(node.tag, path, state);
  utils.catchup(node.tag.range[1], state);
  utils.append('(function() { var siteObj = [', state);
  for (var ii = 0; ii < numQuasis; ii++) {
    utils.append(getCookedValue(template.quasis[ii]), state);
    if (ii !== numQuasis - 1) {
      utils.append(', ', state);
    }
  }
  utils.append(']; siteObj.raw = [', state);
  for (ii = 0; ii < numQuasis; ii++) {
    utils.append(getRawValue(template.quasis[ii]), state);
    if (ii !== numQuasis - 1) {
      utils.append(', ', state);
    }
  }
  utils.append(']; Object.freeze(siteObj.raw); Object.freeze(siteObj); return siteObj; }()', state);
  if (numQuasis > 1) {
    for (ii = 0; ii < template.expressions.length; ii++) {
      var expression = template.expressions[ii];
      utils.append(', ', state);
      utils.move(template.quasis[ii].range[0], state);
      utils.catchupNewlines(template.quasis[ii].range[1], state);
      utils.move(expression.range[0], state);
      traverse(expression, path, state);
      utils.catchup(expression.range[1], state);
    }
  }
  utils.catchupNewlines(node.range[1], state);
  utils.append(')', state);
  return false;
}
visitTaggedTemplateExpression.test = function(node, path, state) {
  return node.type === Syntax.TaggedTemplateExpression;
};
function getCookedValue(templateElement) {
  return JSON.stringify(templateElement.value.cooked);
}
function getRawValue(templateElement) {
  return JSON.stringify(templateElement.value.raw);
}
exports.visitorList = [visitTemplateLiteral, visitTaggedTemplateExpression];
