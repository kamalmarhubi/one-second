/* */ 
(function(Buffer, process) {
  var Syntax = require("esprima-fb").Syntax;
  var leadingIndentRegexp = /(^|\n)( {2}|\t)/g;
  var nonWhiteRegexp = /(\S)/g;
  function createState(source, rootNode, transformOptions) {
    return {
      localScope: {
        parentNode: rootNode,
        parentScope: null,
        identifiers: {},
        tempVarIndex: 0,
        tempVars: []
      },
      superClass: null,
      mungeNamespace: '',
      methodNode: null,
      methodFuncNode: null,
      className: null,
      scopeIsStrict: null,
      indentBy: 0,
      g: {
        opts: transformOptions,
        position: 0,
        extra: {},
        buffer: '',
        source: source,
        docblock: null,
        tagNamespaceUsed: false,
        isBolt: undefined,
        sourceMap: null,
        sourceMapFilename: 'source.js',
        sourceLine: 1,
        bufferLine: 1,
        originalProgramAST: null,
        sourceColumn: 0,
        bufferColumn: 0
      }
    };
  }
  function updateState(state, update) {
    var ret = Object.create(state);
    Object.keys(update).forEach(function(updatedKey) {
      ret[updatedKey] = update[updatedKey];
    });
    return ret;
  }
  function catchup(end, state, contentTransformer) {
    if (end < state.g.position) {
      return;
    }
    var source = state.g.source.substring(state.g.position, end);
    var transformed = updateIndent(source, state);
    if (state.g.sourceMap && transformed) {
      state.g.sourceMap.addMapping({
        generated: {
          line: state.g.bufferLine,
          column: state.g.bufferColumn
        },
        original: {
          line: state.g.sourceLine,
          column: state.g.sourceColumn
        },
        source: state.g.sourceMapFilename
      });
      var sourceLines = source.split('\n');
      var transformedLines = transformed.split('\n');
      for (var i = 1; i < sourceLines.length - 1; i++) {
        state.g.sourceMap.addMapping({
          generated: {
            line: state.g.bufferLine,
            column: 0
          },
          original: {
            line: state.g.sourceLine,
            column: 0
          },
          source: state.g.sourceMapFilename
        });
        state.g.sourceLine++;
        state.g.bufferLine++;
      }
      if (sourceLines.length > 1) {
        state.g.sourceLine++;
        state.g.bufferLine++;
        state.g.sourceColumn = 0;
        state.g.bufferColumn = 0;
      }
      state.g.sourceColumn += sourceLines[sourceLines.length - 1].length;
      state.g.bufferColumn += transformedLines[transformedLines.length - 1].length;
    }
    state.g.buffer += contentTransformer ? contentTransformer(transformed) : transformed;
    state.g.position = end;
  }
  function getNodeSourceText(node, state) {
    return state.g.source.substring(node.range[0], node.range[1]);
  }
  function _replaceNonWhite(value) {
    return value.replace(nonWhiteRegexp, ' ');
  }
  function _stripNonWhite(value) {
    return value.replace(nonWhiteRegexp, '');
  }
  function getNextSyntacticCharOffset(char, state) {
    var pendingSource = state.g.source.substring(state.g.position);
    var pendingSourceLines = pendingSource.split('\n');
    var charOffset = 0;
    var line;
    var withinBlockComment = false;
    var withinString = false;
    lineLoop: while ((line = pendingSourceLines.shift()) !== undefined) {
      var lineEndPos = charOffset + line.length;
      charLoop: for (; charOffset < lineEndPos; charOffset++) {
        var currChar = pendingSource[charOffset];
        if (currChar === '"' || currChar === '\'') {
          withinString = !withinString;
          continue charLoop;
        } else if (withinString) {
          continue charLoop;
        } else if (charOffset + 1 < lineEndPos) {
          var nextTwoChars = currChar + line[charOffset + 1];
          if (nextTwoChars === '//') {
            charOffset = lineEndPos + 1;
            continue lineLoop;
          } else if (nextTwoChars === '/*') {
            withinBlockComment = true;
            charOffset += 1;
            continue charLoop;
          } else if (nextTwoChars === '*/') {
            withinBlockComment = false;
            charOffset += 1;
            continue charLoop;
          }
        }
        if (!withinBlockComment && currChar === char) {
          return charOffset + state.g.position;
        }
      }
      charOffset++;
      withinString = false;
    }
    throw new Error('`' + char + '` not found!');
  }
  function catchupWhiteOut(end, state) {
    catchup(end, state, _replaceNonWhite);
  }
  function catchupWhiteSpace(end, state) {
    catchup(end, state, _stripNonWhite);
  }
  var reNonNewline = /[^\n]/g;
  function stripNonNewline(value) {
    return value.replace(reNonNewline, function() {
      return '';
    });
  }
  function catchupNewlines(end, state) {
    catchup(end, state, stripNonNewline);
  }
  function move(end, state) {
    if (state.g.sourceMap) {
      if (end < state.g.position) {
        state.g.position = 0;
        state.g.sourceLine = 1;
        state.g.sourceColumn = 0;
      }
      var source = state.g.source.substring(state.g.position, end);
      var sourceLines = source.split('\n');
      if (sourceLines.length > 1) {
        state.g.sourceLine += sourceLines.length - 1;
        state.g.sourceColumn = 0;
      }
      state.g.sourceColumn += sourceLines[sourceLines.length - 1].length;
    }
    state.g.position = end;
  }
  function append(str, state) {
    if (state.g.sourceMap && str) {
      state.g.sourceMap.addMapping({
        generated: {
          line: state.g.bufferLine,
          column: state.g.bufferColumn
        },
        original: {
          line: state.g.sourceLine,
          column: state.g.sourceColumn
        },
        source: state.g.sourceMapFilename
      });
      var transformedLines = str.split('\n');
      if (transformedLines.length > 1) {
        state.g.bufferLine += transformedLines.length - 1;
        state.g.bufferColumn = 0;
      }
      state.g.bufferColumn += transformedLines[transformedLines.length - 1].length;
    }
    state.g.buffer += str;
  }
  function updateIndent(str, state) {
    var indentBy = state.indentBy;
    if (indentBy < 0) {
      for (var i = 0; i < -indentBy; i++) {
        str = str.replace(leadingIndentRegexp, '$1');
      }
    } else {
      for (var i = 0; i < indentBy; i++) {
        str = str.replace(leadingIndentRegexp, '$1$2$2');
      }
    }
    return str;
  }
  function indentBefore(start, state) {
    var end = start;
    start = start - 1;
    while (start > 0 && state.g.source[start] != '\n') {
      if (!state.g.source[start].match(/[ \t]/)) {
        end = start;
      }
      start--;
    }
    return state.g.source.substring(start + 1, end);
  }
  function getDocblock(state) {
    if (!state.g.docblock) {
      var docblock = require("./docblock");
      state.g.docblock = docblock.parseAsObject(docblock.extract(state.g.source));
    }
    return state.g.docblock;
  }
  function identWithinLexicalScope(identName, state, stopBeforeNode) {
    var currScope = state.localScope;
    while (currScope) {
      if (currScope.identifiers[identName] !== undefined) {
        return true;
      }
      if (stopBeforeNode && currScope.parentNode === stopBeforeNode) {
        break;
      }
      currScope = currScope.parentScope;
    }
    return false;
  }
  function identInLocalScope(identName, state) {
    return state.localScope.identifiers[identName] !== undefined;
  }
  function initScopeMetadata(boundaryNode, path, node) {
    return {
      boundaryNode: boundaryNode,
      bindingPath: path,
      bindingNode: node
    };
  }
  function declareIdentInLocalScope(identName, metaData, state) {
    state.localScope.identifiers[identName] = {
      boundaryNode: metaData.boundaryNode,
      path: metaData.bindingPath,
      node: metaData.bindingNode,
      state: Object.create(state)
    };
  }
  function getLexicalBindingMetadata(identName, state) {
    var currScope = state.localScope;
    while (currScope) {
      if (currScope.identifiers[identName] !== undefined) {
        return currScope.identifiers[identName];
      }
      currScope = currScope.parentScope;
    }
  }
  function getLocalBindingMetadata(identName, state) {
    return state.localScope.identifiers[identName];
  }
  function analyzeAndTraverse(analyzer, traverser, node, path, state) {
    if (node.type) {
      if (analyzer(node, path, state) === false) {
        return;
      }
      path.unshift(node);
    }
    getOrderedChildren(node).forEach(function(child) {
      traverser(child, path, state);
    });
    node.type && path.shift();
  }
  function getOrderedChildren(node) {
    var queue = [];
    for (var key in node) {
      if (node.hasOwnProperty(key)) {
        enqueueNodeWithStartIndex(queue, node[key]);
      }
    }
    queue.sort(function(a, b) {
      return a[1] - b[1];
    });
    return queue.map(function(pair) {
      return pair[0];
    });
  }
  function enqueueNodeWithStartIndex(queue, node) {
    if (typeof node !== 'object' || node === null) {
      return;
    }
    if (node.range) {
      queue.push([node, node.range[0]]);
    } else if (Array.isArray(node)) {
      for (var ii = 0; ii < node.length; ii++) {
        enqueueNodeWithStartIndex(queue, node[ii]);
      }
    }
  }
  function containsChildOfType(node, type) {
    return containsChildMatching(node, function(node) {
      return node.type === type;
    });
  }
  function containsChildMatching(node, matcher) {
    var foundMatchingChild = false;
    function nodeTypeAnalyzer(node) {
      if (matcher(node) === true) {
        foundMatchingChild = true;
        return false;
      }
    }
    function nodeTypeTraverser(child, path, state) {
      if (!foundMatchingChild) {
        foundMatchingChild = containsChildMatching(child, matcher);
      }
    }
    analyzeAndTraverse(nodeTypeAnalyzer, nodeTypeTraverser, node, []);
    return foundMatchingChild;
  }
  var scopeTypes = {};
  scopeTypes[Syntax.ArrowFunctionExpression] = true;
  scopeTypes[Syntax.FunctionExpression] = true;
  scopeTypes[Syntax.FunctionDeclaration] = true;
  scopeTypes[Syntax.Program] = true;
  function getBoundaryNode(path) {
    for (var ii = 0; ii < path.length; ++ii) {
      if (scopeTypes[path[ii].type]) {
        return path[ii];
      }
    }
    throw new Error('Expected to find a node with one of the following types in path:\n' + JSON.stringify(Object.keys(scopeTypes)));
  }
  function getTempVar(tempVarIndex) {
    return '$__' + tempVarIndex;
  }
  function injectTempVar(state) {
    var tempVar = '$__' + (state.localScope.tempVarIndex++);
    state.localScope.tempVars.push(tempVar);
    return tempVar;
  }
  function injectTempVarDeclarations(state, index) {
    if (state.localScope.tempVars.length) {
      state.g.buffer = state.g.buffer.slice(0, index) + 'var ' + state.localScope.tempVars.join(', ') + ';' + state.g.buffer.slice(index);
      state.localScope.tempVars = [];
    }
  }
  exports.analyzeAndTraverse = analyzeAndTraverse;
  exports.append = append;
  exports.catchup = catchup;
  exports.catchupNewlines = catchupNewlines;
  exports.catchupWhiteOut = catchupWhiteOut;
  exports.catchupWhiteSpace = catchupWhiteSpace;
  exports.containsChildMatching = containsChildMatching;
  exports.containsChildOfType = containsChildOfType;
  exports.createState = createState;
  exports.declareIdentInLocalScope = declareIdentInLocalScope;
  exports.getBoundaryNode = getBoundaryNode;
  exports.getDocblock = getDocblock;
  exports.getLexicalBindingMetadata = getLexicalBindingMetadata;
  exports.getLocalBindingMetadata = getLocalBindingMetadata;
  exports.getNextSyntacticCharOffset = getNextSyntacticCharOffset;
  exports.getNodeSourceText = getNodeSourceText;
  exports.getOrderedChildren = getOrderedChildren;
  exports.getTempVar = getTempVar;
  exports.identInLocalScope = identInLocalScope;
  exports.identWithinLexicalScope = identWithinLexicalScope;
  exports.indentBefore = indentBefore;
  exports.initScopeMetadata = initScopeMetadata;
  exports.injectTempVar = injectTempVar;
  exports.injectTempVarDeclarations = injectTempVarDeclarations;
  exports.move = move;
  exports.scopeTypes = scopeTypes;
  exports.updateIndent = updateIndent;
  exports.updateState = updateState;
})(require("buffer").Buffer, require("process"));
