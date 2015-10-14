/* */ 
"format cjs";
if (typeof define !== 'function') {
  var define = require("amdefine")(module, require);
}
define(function(require, exports, module) {
  var base64VLQ = require("../../lib/source-map/base64-vlq");
  exports['test normal encoding and decoding'] = function(assert, util) {
    var result;
    for (var i = -255; i < 256; i++) {
      result = base64VLQ.decode(base64VLQ.encode(i));
      assert.ok(result);
      assert.equal(result.value, i);
      assert.equal(result.rest, "");
    }
  };
});
