/* */ 
(function(process) {
  'use strict';
  var LinkedValueUtils = require("./LinkedValueUtils");
  var ReactMount = require("./ReactMount");
  var ReactUpdates = require("./ReactUpdates");
  var assign = require("./Object.assign");
  var warning = require("fbjs/lib/warning");
  var valueContextKey = '__ReactDOMSelect_value$' + Math.random().toString(36).slice(2);
  function updateOptionsIfPendingUpdateAndMounted() {
    if (this._rootNodeID && this._wrapperState.pendingUpdate) {
      this._wrapperState.pendingUpdate = false;
      var props = this._currentElement.props;
      var value = LinkedValueUtils.getValue(props);
      if (value != null) {
        updateOptions(this, props, value);
      }
    }
  }
  function getDeclarationErrorAddendum(owner) {
    if (owner) {
      var name = owner.getName();
      if (name) {
        return ' Check the render method of `' + name + '`.';
      }
    }
    return '';
  }
  var valuePropNames = ['value', 'defaultValue'];
  function checkSelectPropTypes(inst, props) {
    var owner = inst._currentElement._owner;
    LinkedValueUtils.checkPropTypes('select', props, owner);
    for (var i = 0; i < valuePropNames.length; i++) {
      var propName = valuePropNames[i];
      if (props[propName] == null) {
        continue;
      }
      if (props.multiple) {
        process.env.NODE_ENV !== 'production' ? warning(Array.isArray(props[propName]), 'The `%s` prop supplied to <select> must be an array if ' + '`multiple` is true.%s', propName, getDeclarationErrorAddendum(owner)) : undefined;
      } else {
        process.env.NODE_ENV !== 'production' ? warning(!Array.isArray(props[propName]), 'The `%s` prop supplied to <select> must be a scalar ' + 'value if `multiple` is false.%s', propName, getDeclarationErrorAddendum(owner)) : undefined;
      }
    }
  }
  function updateOptions(inst, multiple, propValue) {
    var selectedValue,
        i;
    var options = ReactMount.getNode(inst._rootNodeID).options;
    if (multiple) {
      selectedValue = {};
      for (i = 0; i < propValue.length; i++) {
        selectedValue['' + propValue[i]] = true;
      }
      for (i = 0; i < options.length; i++) {
        var selected = selectedValue.hasOwnProperty(options[i].value);
        if (options[i].selected !== selected) {
          options[i].selected = selected;
        }
      }
    } else {
      selectedValue = '' + propValue;
      for (i = 0; i < options.length; i++) {
        if (options[i].value === selectedValue) {
          options[i].selected = true;
          return;
        }
      }
      if (options.length) {
        options[0].selected = true;
      }
    }
  }
  var ReactDOMSelect = {
    valueContextKey: valueContextKey,
    getNativeProps: function(inst, props, context) {
      return assign({}, props, {
        onChange: inst._wrapperState.onChange,
        value: undefined
      });
    },
    mountWrapper: function(inst, props) {
      if (process.env.NODE_ENV !== 'production') {
        checkSelectPropTypes(inst, props);
      }
      var value = LinkedValueUtils.getValue(props);
      inst._wrapperState = {
        pendingUpdate: false,
        initialValue: value != null ? value : props.defaultValue,
        onChange: _handleChange.bind(inst),
        wasMultiple: Boolean(props.multiple)
      };
    },
    processChildContext: function(inst, props, context) {
      var childContext = assign({}, context);
      childContext[valueContextKey] = inst._wrapperState.initialValue;
      return childContext;
    },
    postUpdateWrapper: function(inst) {
      var props = inst._currentElement.props;
      inst._wrapperState.initialValue = undefined;
      var wasMultiple = inst._wrapperState.wasMultiple;
      inst._wrapperState.wasMultiple = Boolean(props.multiple);
      var value = LinkedValueUtils.getValue(props);
      if (value != null) {
        inst._wrapperState.pendingUpdate = false;
        updateOptions(inst, Boolean(props.multiple), value);
      } else if (wasMultiple !== Boolean(props.multiple)) {
        if (props.defaultValue != null) {
          updateOptions(inst, Boolean(props.multiple), props.defaultValue);
        } else {
          updateOptions(inst, Boolean(props.multiple), props.multiple ? [] : '');
        }
      }
    }
  };
  function _handleChange(event) {
    var props = this._currentElement.props;
    var returnValue = LinkedValueUtils.executeOnChange(props, event);
    this._wrapperState.pendingUpdate = true;
    ReactUpdates.asap(updateOptionsIfPendingUpdateAndMounted, this);
    return returnValue;
  }
  module.exports = ReactDOMSelect;
})(require("process"));
