/* */ 
var restParamVisitors = require("./es6-rest-param-visitors");
var destructuringVisitors = require("./es6-destructuring-visitors");
var Syntax = require("esprima-fb").Syntax;
var utils = require("../src/utils");
function visitArrowFunction(traverse, node, path, state) {
  var notInExpression = (path[0].type === Syntax.ExpressionStatement);
  if (notInExpression) {
    utils.append('(', state);
  }
  utils.append('function', state);
  renderParams(traverse, node, path, state);
  utils.catchupWhiteSpace(node.body.range[0], state);
  var renderBody = node.body.type == Syntax.BlockStatement ? renderStatementBody : renderExpressionBody;
  path.unshift(node);
  renderBody(traverse, node, path, state);
  path.shift();
  var containsBindingSyntax = utils.containsChildMatching(node.body, function(node) {
    return node.type === Syntax.ThisExpression || (node.type === Syntax.Identifier && node.name === "super");
  });
  if (containsBindingSyntax) {
    utils.append('.bind(this)', state);
  }
  utils.catchupWhiteSpace(node.range[1], state);
  if (notInExpression) {
    utils.append(')', state);
  }
  return false;
}
function renderParams(traverse, node, path, state) {
  if (isParensFreeSingleParam(node, state) || !node.params.length) {
    utils.append('(', state);
  }
  if (node.params.length !== 0) {
    path.unshift(node);
    traverse(node.params, path, state);
    path.unshift();
  }
  utils.append(')', state);
}
function isParensFreeSingleParam(node, state) {
  return node.params.length === 1 && state.g.source[state.g.position] !== '(';
}
function renderExpressionBody(traverse, node, path, state) {
  utils.append('{', state);
  if (node.rest) {
    utils.append(restParamVisitors.renderRestParamSetup(node, state), state);
  }
  destructuringVisitors.renderDestructuredComponents(node, utils.updateState(state, {localScope: {
      parentNode: state.parentNode,
      parentScope: state.parentScope,
      identifiers: state.identifiers,
      tempVarIndex: 0
    }}));
  utils.append('return ', state);
  renderStatementBody(traverse, node, path, state);
  utils.append(';}', state);
}
function renderStatementBody(traverse, node, path, state) {
  traverse(node.body, path, state);
  utils.catchup(node.body.range[1], state);
}
visitArrowFunction.test = function(node, path, state) {
  return node.type === Syntax.ArrowFunctionExpression;
};
exports.visitorList = [visitArrowFunction];
