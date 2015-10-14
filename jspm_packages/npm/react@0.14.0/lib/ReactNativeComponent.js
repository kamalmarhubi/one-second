/* */ 
(function(process) {
  'use strict';
  var assign = require("./Object.assign");
  var invariant = require("fbjs/lib/invariant");
  var autoGenerateWrapperClass = null;
  var genericComponentClass = null;
  var tagToComponentClass = {};
  var textComponentClass = null;
  var ReactNativeComponentInjection = {
    injectGenericComponentClass: function(componentClass) {
      genericComponentClass = componentClass;
    },
    injectTextComponentClass: function(componentClass) {
      textComponentClass = componentClass;
    },
    injectComponentClasses: function(componentClasses) {
      assign(tagToComponentClass, componentClasses);
    }
  };
  function getComponentClassForElement(element) {
    if (typeof element.type === 'function') {
      return element.type;
    }
    var tag = element.type;
    var componentClass = tagToComponentClass[tag];
    if (componentClass == null) {
      tagToComponentClass[tag] = componentClass = autoGenerateWrapperClass(tag);
    }
    return componentClass;
  }
  function createInternalComponent(element) {
    !genericComponentClass ? process.env.NODE_ENV !== 'production' ? invariant(false, 'There is no registered component for the tag %s', element.type) : invariant(false) : undefined;
    return new genericComponentClass(element.type, element.props);
  }
  function createInstanceForText(text) {
    return new textComponentClass(text);
  }
  function isTextComponent(component) {
    return component instanceof textComponentClass;
  }
  var ReactNativeComponent = {
    getComponentClassForElement: getComponentClassForElement,
    createInternalComponent: createInternalComponent,
    createInstanceForText: createInstanceForText,
    isTextComponent: isTextComponent,
    injection: ReactNativeComponentInjection
  };
  module.exports = ReactNativeComponent;
})(require("process"));
