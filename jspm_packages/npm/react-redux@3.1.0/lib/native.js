/* */ 
'use strict';
exports.__esModule = true;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
var _reactNative = require("react-native");
var _reactNative2 = _interopRequireDefault(_reactNative);
var _componentsCreateAll = require("./components/createAll");
var _componentsCreateAll2 = _interopRequireDefault(_componentsCreateAll);
var _createAll = _componentsCreateAll2['default'](_reactNative2['default']);
var Provider = _createAll.Provider;
var connect = _createAll.connect;
exports.Provider = Provider;
exports.connect = connect;
