/* */ 
var asap = require("asap");
if (typeof Promise === 'undefined') {
  Promise = require("./lib/core");
  require("./lib/es6-extensions");
}
require("./polyfill-done");
