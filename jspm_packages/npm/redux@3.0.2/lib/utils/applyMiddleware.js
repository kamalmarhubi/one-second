/* */ 
'use strict';
exports.__esModule = true;
var _extends = Object.assign || function(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};
exports['default'] = applyMiddleware;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
var _compose = require("./compose");
var _compose2 = _interopRequireDefault(_compose);
function applyMiddleware() {
  for (var _len = arguments.length,
      middlewares = Array(_len),
      _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }
  return function(next) {
    return function(reducer, initialState) {
      var store = next(reducer, initialState);
      var _dispatch = store.dispatch;
      var chain = [];
      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch(action) {
          return _dispatch(action);
        }
      };
      chain = middlewares.map(function(middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = _compose2['default'].apply(undefined, chain)(store.dispatch);
      return _extends({}, store, {dispatch: _dispatch});
    };
  };
}
module.exports = exports['default'];
