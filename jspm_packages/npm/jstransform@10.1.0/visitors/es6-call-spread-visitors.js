/* */ 
(function(process) {
  var Syntax = require("esprima-fb").Syntax;
  var utils = require("../src/utils");
  function process(traverse, node, path, state) {
    utils.move(node.range[0], state);
    traverse(node, path, state);
    utils.catchup(node.range[1], state);
  }
  function visitCallSpread(traverse, node, path, state) {
    utils.catchup(node.range[0], state);
    if (node.type === Syntax.NewExpression) {
      utils.append('new (Function.prototype.bind.apply(', state);
      process(traverse, node.callee, path, state);
    } else if (node.callee.type === Syntax.MemberExpression) {
      var tempVar = utils.injectTempVar(state);
      utils.append('(' + tempVar + ' = ', state);
      process(traverse, node.callee.object, path, state);
      utils.append(')', state);
      if (node.callee.property.type === Syntax.Identifier) {
        utils.append('.', state);
        process(traverse, node.callee.property, path, state);
      } else {
        utils.append('[', state);
        process(traverse, node.callee.property, path, state);
        utils.append(']', state);
      }
      utils.append('.apply(' + tempVar, state);
    } else {
      var needsToBeWrappedInParenthesis = node.callee.type === Syntax.FunctionDeclaration || node.callee.type === Syntax.FunctionExpression;
      if (needsToBeWrappedInParenthesis) {
        utils.append('(', state);
      }
      process(traverse, node.callee, path, state);
      if (needsToBeWrappedInParenthesis) {
        utils.append(')', state);
      }
      utils.append('.apply(null', state);
    }
    utils.append(', ', state);
    var args = node.arguments.slice();
    var spread = args.pop();
    if (args.length || node.type === Syntax.NewExpression) {
      utils.append('[', state);
      if (node.type === Syntax.NewExpression) {
        utils.append('null' + (args.length ? ', ' : ''), state);
      }
      while (args.length) {
        var arg = args.shift();
        utils.move(arg.range[0], state);
        traverse(arg, path, state);
        if (args.length) {
          utils.catchup(args[0].range[0], state);
        } else {
          utils.catchup(arg.range[1], state);
        }
      }
      utils.append('].concat(', state);
      process(traverse, spread.argument, path, state);
      utils.append(')', state);
    } else {
      process(traverse, spread.argument, path, state);
    }
    utils.append(node.type === Syntax.NewExpression ? '))' : ')', state);
    utils.move(node.range[1], state);
    return false;
  }
  visitCallSpread.test = function(node, path, state) {
    return ((node.type === Syntax.CallExpression || node.type === Syntax.NewExpression) && node.arguments.length > 0 && node.arguments[node.arguments.length - 1].type === Syntax.SpreadElement);
  };
  exports.visitorList = [visitCallSpread];
})(require("process"));
