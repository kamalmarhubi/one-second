/* */ 
'use strict';
var $def = require("./$.def"),
    context = require("./$.string-context"),
    INCLUDES = 'includes';
$def($def.P + $def.F * require("./$.fails-is-regexp")(INCLUDES), 'String', {includes: function includes(searchString) {
    return !!~context(this, searchString, INCLUDES).indexOf(searchString, arguments[1]);
  }});
