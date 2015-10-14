/* */ 
'use strict';

exports.__esModule = true;
exports['default'] = wrapActionCreators;

var _redux = require('redux');

function wrapActionCreators(actionCreators) {
  return function (dispatch) {
    return _redux.bindActionCreators(actionCreators, dispatch);
  };
}

module.exports = exports['default'];