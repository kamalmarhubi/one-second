/* */ 
'use strict';
var $def = require("./$.def"),
    toLength = require("./$.to-length"),
    context = require("./$.string-context"),
    ENDS_WITH = 'endsWith',
    $endsWith = ''[ENDS_WITH];
$def($def.P + $def.F * require("./$.fails-is-regexp")(ENDS_WITH), 'String', {endsWith: function endsWith(searchString) {
    var that = context(this, searchString, ENDS_WITH),
        endPosition = arguments[1],
        len = toLength(that.length),
        end = endPosition === undefined ? len : Math.min(toLength(endPosition), len),
        search = String(searchString);
    return $endsWith ? $endsWith.call(that, search, end) : that.slice(end - search.length, end) === search;
  }});
