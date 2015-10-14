/* */ 
(function(process) {
  'use strict';
  var ReactElement = require("./ReactElement");
  var ReactPropTransferer = require("./ReactPropTransferer");
  var keyOf = require("fbjs/lib/keyOf");
  var warning = require("fbjs/lib/warning");
  var CHILDREN_PROP = keyOf({children: null});
  var didDeprecatedWarn = false;
  function cloneWithProps(child, props) {
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(didDeprecatedWarn, 'cloneWithProps(...) is deprecated. ' + 'Please use React.cloneElement instead.') : undefined;
      didDeprecatedWarn = true;
      process.env.NODE_ENV !== 'production' ? warning(!child.ref, 'You are calling cloneWithProps() on a child with a ref. This is ' + 'dangerous because you\'re creating a new child which will not be ' + 'added as a ref to its parent.') : undefined;
    }
    var newProps = ReactPropTransferer.mergeProps(props, child.props);
    if (!newProps.hasOwnProperty(CHILDREN_PROP) && child.props.hasOwnProperty(CHILDREN_PROP)) {
      newProps.children = child.props.children;
    }
    return ReactElement.createElement(child.type, newProps);
  }
  module.exports = cloneWithProps;
})(require("process"));
