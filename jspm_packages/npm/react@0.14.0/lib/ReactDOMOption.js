/* */ 
(function(process) {
  'use strict';
  var ReactChildren = require("./ReactChildren");
  var ReactDOMSelect = require("./ReactDOMSelect");
  var assign = require("./Object.assign");
  var warning = require("fbjs/lib/warning");
  var valueContextKey = ReactDOMSelect.valueContextKey;
  var ReactDOMOption = {
    mountWrapper: function(inst, props, context) {
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(props.selected == null, 'Use the `defaultValue` or `value` props on <select> instead of ' + 'setting `selected` on <option>.') : undefined;
      }
      var selectValue = context[valueContextKey];
      var selected = null;
      if (selectValue != null) {
        selected = false;
        if (Array.isArray(selectValue)) {
          for (var i = 0; i < selectValue.length; i++) {
            if ('' + selectValue[i] === '' + props.value) {
              selected = true;
              break;
            }
          }
        } else {
          selected = '' + selectValue === '' + props.value;
        }
      }
      inst._wrapperState = {selected: selected};
    },
    getNativeProps: function(inst, props, context) {
      var nativeProps = assign({
        selected: undefined,
        children: undefined
      }, props);
      if (inst._wrapperState.selected != null) {
        nativeProps.selected = inst._wrapperState.selected;
      }
      var content = '';
      ReactChildren.forEach(props.children, function(child) {
        if (child == null) {
          return;
        }
        if (typeof child === 'string' || typeof child === 'number') {
          content += child;
        } else {
          process.env.NODE_ENV !== 'production' ? warning(false, 'Only strings and numbers are supported as <option> children.') : undefined;
        }
      });
      nativeProps.children = content;
      return nativeProps;
    }
  };
  module.exports = ReactDOMOption;
})(require("process"));
