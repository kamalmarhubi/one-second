/* */ 
'use strict';
exports.__esModule = true;
exports['default'] = bindActionCreators;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
var _utilsMapValues = require("./mapValues");
var _utilsMapValues2 = _interopRequireDefault(_utilsMapValues);
function bindActionCreator(actionCreator, dispatch) {
  return function() {
    return dispatch(actionCreator.apply(undefined, arguments));
  };
}
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }
  if (typeof actionCreators !== 'object' || actionCreators === null || actionCreators === undefined) {
    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
  }
  return _utilsMapValues2['default'](actionCreators, function(actionCreator) {
    return bindActionCreator(actionCreator, dispatch);
  });
}
module.exports = exports['default'];
