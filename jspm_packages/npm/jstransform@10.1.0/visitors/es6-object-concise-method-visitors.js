/* */ 
var Syntax = require("esprima-fb").Syntax;
var utils = require("../src/utils");
var reservedWordsHelper = require("./reserved-words-helper");
function visitObjectConciseMethod(traverse, node, path, state) {
  var isGenerator = node.value.generator;
  if (isGenerator) {
    utils.catchupWhiteSpace(node.range[0] + 1, state);
  }
  if (node.computed) {
    utils.catchup(node.key.range[1] + 1, state);
  } else if (reservedWordsHelper.isReservedWord(node.key.name)) {
    utils.catchup(node.key.range[0], state);
    utils.append('"', state);
    utils.catchup(node.key.range[1], state);
    utils.append('"', state);
  }
  utils.catchup(node.key.range[1], state);
  utils.append(':function' + (isGenerator ? '*' : ''), state);
  path.unshift(node);
  traverse(node.value, path, state);
  path.shift();
  return false;
}
visitObjectConciseMethod.test = function(node, path, state) {
  return node.type === Syntax.Property && node.value.type === Syntax.FunctionExpression && node.method === true;
};
exports.visitorList = [visitObjectConciseMethod];
