/* */ 
var Syntax = require("esprima-fb").Syntax;
var utils = require("../src/utils");
function visitObjectLiteralSpread(traverse, node, path, state) {
  utils.catchup(node.range[0], state);
  utils.append('Object.assign({', state);
  utils.move(node.range[0] + 1, state);
  var previousWasSpread = false;
  for (var i = 0; i < node.properties.length; i++) {
    var property = node.properties[i];
    if (property.type === Syntax.SpreadProperty) {
      if (!previousWasSpread) {
        utils.append('}', state);
      }
      if (i === 0) {
        utils.append(',', state);
      }
      utils.catchup(property.range[0], state);
      utils.move(property.range[0] + 3, state);
      traverse(property.argument, path, state);
      utils.catchup(property.range[1], state);
      previousWasSpread = true;
    } else {
      utils.catchup(property.range[0], state);
      if (previousWasSpread) {
        utils.append('{', state);
      }
      traverse(property, path, state);
      utils.catchup(property.range[1], state);
      previousWasSpread = false;
    }
  }
  utils.catchupWhiteSpace(node.range[1] - 1, state);
  utils.move(node.range[1], state);
  if (!previousWasSpread) {
    utils.append('}', state);
  }
  utils.append(')', state);
  return false;
}
visitObjectLiteralSpread.test = function(node, path, state) {
  if (node.type !== Syntax.ObjectExpression) {
    return false;
  }
  var hasAtLeastOneSpreadProperty = false;
  for (var i = 0; i < node.properties.length; i++) {
    var property = node.properties[i];
    if (property.type === Syntax.SpreadProperty) {
      hasAtLeastOneSpreadProperty = true;
    } else if (property.kind !== 'init') {
      return false;
    }
  }
  return hasAtLeastOneSpreadProperty;
};
exports.visitorList = [visitObjectLiteralSpread];
