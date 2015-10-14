/* */ 
"format cjs";
if (typeof define !== 'function') {
  var define = require("amdefine")(module, require);
}
define(function(require, exports, module) {
  var binarySearch = require("../../lib/source-map/binary-search");
  function numberCompare(a, b) {
    return a - b;
  }
  exports['test too high'] = function(assert, util) {
    var needle = 30;
    var haystack = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    assert.doesNotThrow(function() {
      binarySearch.search(needle, haystack, numberCompare);
    });
    assert.equal(binarySearch.search(needle, haystack, numberCompare), 20);
  };
  exports['test too low'] = function(assert, util) {
    var needle = 1;
    var haystack = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    assert.doesNotThrow(function() {
      binarySearch.search(needle, haystack, numberCompare);
    });
    assert.equal(binarySearch.search(needle, haystack, numberCompare), null);
  };
  exports['test exact search'] = function(assert, util) {
    var needle = 4;
    var haystack = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    assert.equal(binarySearch.search(needle, haystack, numberCompare), 4);
  };
  exports['test fuzzy search'] = function(assert, util) {
    var needle = 19;
    var haystack = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
    assert.equal(binarySearch.search(needle, haystack, numberCompare), 18);
  };
});
