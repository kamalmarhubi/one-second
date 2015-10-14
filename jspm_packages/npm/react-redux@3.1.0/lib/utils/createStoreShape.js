/* */ 
"use strict";

exports.__esModule = true;
exports["default"] = createStoreShape;

function createStoreShape(PropTypes) {
  return PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired
  });
}

module.exports = exports["default"];