/* */ 
'use strict';
exports.__esModule = true;
exports['default'] = createStore;
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}
var _utilsIsPlainObject = require("./utils/isPlainObject");
var _utilsIsPlainObject2 = _interopRequireDefault(_utilsIsPlainObject);
var ActionTypes = {INIT: '@@redux/INIT'};
exports.ActionTypes = ActionTypes;
function createStore(reducer, initialState) {
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }
  var currentReducer = reducer;
  var currentState = initialState;
  var listeners = [];
  var isDispatching = false;
  function getState() {
    return currentState;
  }
  function subscribe(listener) {
    listeners.push(listener);
    return function unsubscribe() {
      var index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }
  function dispatch(action) {
    if (!_utilsIsPlainObject2['default'](action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }
    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }
    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }
    listeners.slice().forEach(function(listener) {
      return listener();
    });
    return action;
  }
  function replaceReducer(nextReducer) {
    currentReducer = nextReducer;
    dispatch({type: ActionTypes.INIT});
  }
  dispatch({type: ActionTypes.INIT});
  return {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  };
}
