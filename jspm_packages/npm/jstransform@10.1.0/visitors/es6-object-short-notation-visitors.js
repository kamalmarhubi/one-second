/* */ 
var Syntax = require("esprima-fb").Syntax;
var utils = require("../src/utils");
function visitObjectLiteralShortNotation(traverse, node, path, state) {
  utils.catchup(node.key.range[1], state);
  utils.append(':' + node.key.name, state);
  return false;
}
visitObjectLiteralShortNotation.test = function(node, path, state) {
  return node.type === Syntax.Property && node.kind === 'init' && node.shorthand === true && path[0].type !== Syntax.ObjectPattern;
};
exports.visitorList = [visitObjectLiteralShortNotation];
