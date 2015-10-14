/* */ 
'use strict';
exports.__esModule = true;
exports['default'] = createAll;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
var _createProvider = require("./createProvider");
var _createProvider2 = _interopRequireDefault(_createProvider);
var _createConnect = require("./createConnect");
var _createConnect2 = _interopRequireDefault(_createConnect);
function createAll(React) {
  var Provider = _createProvider2['default'](React);
  var connect = _createConnect2['default'](React);
  return {
    Provider: Provider,
    connect: connect
  };
}
module.exports = exports['default'];
