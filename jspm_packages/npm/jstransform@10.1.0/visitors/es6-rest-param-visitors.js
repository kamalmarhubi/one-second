/* */ 
var Syntax = require("esprima-fb").Syntax;
var utils = require("../src/utils");
function _nodeIsFunctionWithRestParam(node) {
  return (node.type === Syntax.FunctionDeclaration || node.type === Syntax.FunctionExpression || node.type === Syntax.ArrowFunctionExpression) && node.rest;
}
function visitFunctionParamsWithRestParam(traverse, node, path, state) {
  if (node.parametricType) {
    utils.catchup(node.parametricType.range[0], state);
    path.unshift(node);
    traverse(node.parametricType, path, state);
    path.shift();
  }
  if (node.params.length) {
    path.unshift(node);
    traverse(node.params, path, state);
    path.shift();
  } else {
    utils.catchup(node.rest.range[0] - 3, state);
  }
  utils.catchupWhiteSpace(node.rest.range[1], state);
  path.unshift(node);
  traverse(node.body, path, state);
  path.shift();
  return false;
}
visitFunctionParamsWithRestParam.test = function(node, path, state) {
  return _nodeIsFunctionWithRestParam(node);
};
function renderRestParamSetup(functionNode, state) {
  var idx = state.localScope.tempVarIndex++;
  var len = state.localScope.tempVarIndex++;
  return 'for (var ' + functionNode.rest.name + '=[],' + utils.getTempVar(idx) + '=' + functionNode.params.length + ',' + utils.getTempVar(len) + '=arguments.length;' + utils.getTempVar(idx) + '<' + utils.getTempVar(len) + ';' + utils.getTempVar(idx) + '++) ' + functionNode.rest.name + '.push(arguments[' + utils.getTempVar(idx) + ']);';
}
function visitFunctionBodyWithRestParam(traverse, node, path, state) {
  utils.catchup(node.range[0] + 1, state);
  var parentNode = path[0];
  utils.append(renderRestParamSetup(parentNode, state), state);
  return true;
}
visitFunctionBodyWithRestParam.test = function(node, path, state) {
  return node.type === Syntax.BlockStatement && _nodeIsFunctionWithRestParam(path[0]);
};
exports.renderRestParamSetup = renderRestParamSetup;
exports.visitorList = [visitFunctionParamsWithRestParam, visitFunctionBodyWithRestParam];
