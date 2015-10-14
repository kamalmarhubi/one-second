/* */ 
(function(process) {
  'use strict';
  var ReactDOMIDOperations = require("./ReactDOMIDOperations");
  var LinkedValueUtils = require("./LinkedValueUtils");
  var ReactMount = require("./ReactMount");
  var ReactUpdates = require("./ReactUpdates");
  var assign = require("./Object.assign");
  var invariant = require("fbjs/lib/invariant");
  var instancesByReactID = {};
  function forceUpdateIfMounted() {
    if (this._rootNodeID) {
      ReactDOMInput.updateWrapper(this);
    }
  }
  var ReactDOMInput = {
    getNativeProps: function(inst, props, context) {
      var value = LinkedValueUtils.getValue(props);
      var checked = LinkedValueUtils.getChecked(props);
      var nativeProps = assign({}, props, {
        defaultChecked: undefined,
        defaultValue: undefined,
        value: value != null ? value : inst._wrapperState.initialValue,
        checked: checked != null ? checked : inst._wrapperState.initialChecked,
        onChange: inst._wrapperState.onChange
      });
      return nativeProps;
    },
    mountWrapper: function(inst, props) {
      if (process.env.NODE_ENV !== 'production') {
        LinkedValueUtils.checkPropTypes('input', props, inst._currentElement._owner);
      }
      var defaultValue = props.defaultValue;
      inst._wrapperState = {
        initialChecked: props.defaultChecked || false,
        initialValue: defaultValue != null ? defaultValue : null,
        onChange: _handleChange.bind(inst)
      };
    },
    mountReadyWrapper: function(inst) {
      instancesByReactID[inst._rootNodeID] = inst;
    },
    unmountWrapper: function(inst) {
      delete instancesByReactID[inst._rootNodeID];
    },
    updateWrapper: function(inst) {
      var props = inst._currentElement.props;
      var checked = props.checked;
      if (checked != null) {
        ReactDOMIDOperations.updatePropertyByID(inst._rootNodeID, 'checked', checked || false);
      }
      var value = LinkedValueUtils.getValue(props);
      if (value != null) {
        ReactDOMIDOperations.updatePropertyByID(inst._rootNodeID, 'value', '' + value);
      }
    }
  };
  function _handleChange(event) {
    var props = this._currentElement.props;
    var returnValue = LinkedValueUtils.executeOnChange(props, event);
    ReactUpdates.asap(forceUpdateIfMounted, this);
    var name = props.name;
    if (props.type === 'radio' && name != null) {
      var rootNode = ReactMount.getNode(this._rootNodeID);
      var queryRoot = rootNode;
      while (queryRoot.parentNode) {
        queryRoot = queryRoot.parentNode;
      }
      var group = queryRoot.querySelectorAll('input[name=' + JSON.stringify('' + name) + '][type="radio"]');
      for (var i = 0; i < group.length; i++) {
        var otherNode = group[i];
        if (otherNode === rootNode || otherNode.form !== rootNode.form) {
          continue;
        }
        var otherID = ReactMount.getID(otherNode);
        !otherID ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactDOMInput: Mixing React and non-React radio inputs with the ' + 'same `name` is not supported.') : invariant(false) : undefined;
        var otherInstance = instancesByReactID[otherID];
        !otherInstance ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactDOMInput: Unknown radio button ID %s.', otherID) : invariant(false) : undefined;
        ReactUpdates.asap(forceUpdateIfMounted, otherInstance);
      }
    }
    return returnValue;
  }
  module.exports = ReactDOMInput;
})(require("process"));
