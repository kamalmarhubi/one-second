/* */ 
(function(process) {
  module.exports = require("./loose-envify")(process.env);
})(require("process"));
