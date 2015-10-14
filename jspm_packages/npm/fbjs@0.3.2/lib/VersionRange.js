/* */ 
(function(process) {
  'use strict';
  var _slicedToArray = (function() {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;
      try {
        for (var _i = arr[Symbol.iterator](),
            _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i)
            break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i['return'])
            _i['return']();
        } finally {
          if (_d)
            throw _e;
        }
      }
      return _arr;
    }
    return function(arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError('Invalid attempt to destructure non-iterable instance');
      }
    };
  })();
  var invariant = require("./invariant");
  var componentRegex = /\./;
  var orRegex = /\|\|/;
  var rangeRegex = /\s+\-\s+/;
  var modifierRegex = /^(<=|<|=|>=|~>|~|>|)?\s*(.+)/;
  var numericRegex = /^(\d*)(.*)/;
  function checkOrExpression(range, version) {
    var expressions = range.split(orRegex);
    if (expressions.length > 1) {
      return expressions.some(function(range) {
        return VersionRange.contains(range, version);
      });
    } else {
      range = expressions[0].trim();
      return checkRangeExpression(range, version);
    }
  }
  function checkRangeExpression(range, version) {
    var expressions = range.split(rangeRegex);
    !(expressions.length > 0 && expressions.length <= 2) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'the "-" operator expects exactly 2 operands') : invariant(false) : undefined;
    if (expressions.length === 1) {
      return checkSimpleExpression(expressions[0], version);
    } else {
      var _expressions = _slicedToArray(expressions, 2);
      var startVersion = _expressions[0];
      var endVersion = _expressions[1];
      !(isSimpleVersion(startVersion) && isSimpleVersion(endVersion)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'operands to the "-" operator must be simple (no modifiers)') : invariant(false) : undefined;
      return checkSimpleExpression('>=' + startVersion, version) && checkSimpleExpression('<=' + endVersion, version);
    }
  }
  function checkSimpleExpression(range, version) {
    range = range.trim();
    if (range === '') {
      return true;
    }
    var versionComponents = version.split(componentRegex);
    var _getModifierAndComponents = getModifierAndComponents(range);
    var modifier = _getModifierAndComponents.modifier;
    var rangeComponents = _getModifierAndComponents.rangeComponents;
    switch (modifier) {
      case '<':
        return checkLessThan(versionComponents, rangeComponents);
      case '<=':
        return checkLessThanOrEqual(versionComponents, rangeComponents);
      case '>=':
        return checkGreaterThanOrEqual(versionComponents, rangeComponents);
      case '>':
        return checkGreaterThan(versionComponents, rangeComponents);
      case '~':
      case '~>':
        return checkApproximateVersion(versionComponents, rangeComponents);
      default:
        return checkEqual(versionComponents, rangeComponents);
    }
  }
  function checkLessThan(a, b) {
    return compareComponents(a, b) === -1;
  }
  function checkLessThanOrEqual(a, b) {
    var result = compareComponents(a, b);
    return result === -1 || result === 0;
  }
  function checkEqual(a, b) {
    return compareComponents(a, b) === 0;
  }
  function checkGreaterThanOrEqual(a, b) {
    var result = compareComponents(a, b);
    return result === 1 || result === 0;
  }
  function checkGreaterThan(a, b) {
    return compareComponents(a, b) === 1;
  }
  function checkApproximateVersion(a, b) {
    var lowerBound = b.slice();
    var upperBound = b.slice();
    if (upperBound.length > 1) {
      upperBound.pop();
    }
    var lastIndex = upperBound.length - 1;
    var numeric = parseInt(upperBound[lastIndex], 10);
    if (isNumber(numeric)) {
      upperBound[lastIndex] = numeric + 1 + '';
    }
    return checkGreaterThanOrEqual(a, lowerBound) && checkLessThan(a, upperBound);
  }
  function getModifierAndComponents(range) {
    var rangeComponents = range.split(componentRegex);
    var matches = rangeComponents[0].match(modifierRegex);
    !matches ? process.env.NODE_ENV !== 'production' ? invariant(false, 'expected regex to match but it did not') : invariant(false) : undefined;
    return {
      modifier: matches[1],
      rangeComponents: [matches[2]].concat(rangeComponents.slice(1))
    };
  }
  function isNumber(number) {
    return !isNaN(number) && isFinite(number);
  }
  function isSimpleVersion(range) {
    return !getModifierAndComponents(range).modifier;
  }
  function zeroPad(array, length) {
    for (var i = array.length; i < length; i++) {
      array[i] = '0';
    }
  }
  function normalizeVersions(a, b) {
    a = a.slice();
    b = b.slice();
    zeroPad(a, b.length);
    for (var i = 0; i < b.length; i++) {
      var matches = b[i].match(/^[x*]$/i);
      if (matches) {
        b[i] = a[i] = '0';
        if (matches[0] === '*' && i === b.length - 1) {
          for (var j = i; j < a.length; j++) {
            a[j] = '0';
          }
        }
      }
    }
    zeroPad(b, a.length);
    return [a, b];
  }
  function compareNumeric(a, b) {
    var aPrefix = a.match(numericRegex)[1];
    var bPrefix = b.match(numericRegex)[1];
    var aNumeric = parseInt(aPrefix, 10);
    var bNumeric = parseInt(bPrefix, 10);
    if (isNumber(aNumeric) && isNumber(bNumeric) && aNumeric !== bNumeric) {
      return compare(aNumeric, bNumeric);
    } else {
      return compare(a, b);
    }
  }
  function compare(a, b) {
    !(typeof a === typeof b) ? process.env.NODE_ENV !== 'production' ? invariant(false, '"a" and "b" must be of the same type') : invariant(false) : undefined;
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    } else {
      return 0;
    }
  }
  function compareComponents(a, b) {
    var _normalizeVersions = normalizeVersions(a, b);
    var _normalizeVersions2 = _slicedToArray(_normalizeVersions, 2);
    var aNormalized = _normalizeVersions2[0];
    var bNormalized = _normalizeVersions2[1];
    for (var i = 0; i < bNormalized.length; i++) {
      var result = compareNumeric(aNormalized[i], bNormalized[i]);
      if (result) {
        return result;
      }
    }
    return 0;
  }
  var VersionRange = {contains: function(range, version) {
      return checkOrExpression(range.trim(), version.trim());
    }};
  module.exports = VersionRange;
})(require("process"));
