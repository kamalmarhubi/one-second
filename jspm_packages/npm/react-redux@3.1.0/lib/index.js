/* */ 
'use strict';
exports.__esModule = true;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
var _react = require("react");
var _react2 = _interopRequireDefault(_react);
var _componentsCreateAll = require("./components/createAll");
var _componentsCreateAll2 = _interopRequireDefault(_componentsCreateAll);
var _createAll = _componentsCreateAll2['default'](_react2['default']);
var Provider = _createAll.Provider;
var connect = _createAll.connect;
exports.Provider = Provider;
exports.connect = connect;
