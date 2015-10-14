/* */ 
(function(process) {
  'use strict';
  var invariant = require("fbjs/lib/invariant");
  function checkMask(value, bitmask) {
    return (value & bitmask) === bitmask;
  }
  var DOMPropertyInjection = {
    MUST_USE_ATTRIBUTE: 0x1,
    MUST_USE_PROPERTY: 0x2,
    HAS_SIDE_EFFECTS: 0x4,
    HAS_BOOLEAN_VALUE: 0x8,
    HAS_NUMERIC_VALUE: 0x10,
    HAS_POSITIVE_NUMERIC_VALUE: 0x20 | 0x10,
    HAS_OVERLOADED_BOOLEAN_VALUE: 0x40,
    injectDOMPropertyConfig: function(domPropertyConfig) {
      var Injection = DOMPropertyInjection;
      var Properties = domPropertyConfig.Properties || {};
      var DOMAttributeNamespaces = domPropertyConfig.DOMAttributeNamespaces || {};
      var DOMAttributeNames = domPropertyConfig.DOMAttributeNames || {};
      var DOMPropertyNames = domPropertyConfig.DOMPropertyNames || {};
      var DOMMutationMethods = domPropertyConfig.DOMMutationMethods || {};
      if (domPropertyConfig.isCustomAttribute) {
        DOMProperty._isCustomAttributeFunctions.push(domPropertyConfig.isCustomAttribute);
      }
      for (var propName in Properties) {
        !!DOMProperty.properties.hasOwnProperty(propName) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'injectDOMPropertyConfig(...): You\'re trying to inject DOM property ' + '\'%s\' which has already been injected. You may be accidentally ' + 'injecting the same DOM property config twice, or you may be ' + 'injecting two configs that have conflicting property names.', propName) : invariant(false) : undefined;
        var lowerCased = propName.toLowerCase();
        var propConfig = Properties[propName];
        var propertyInfo = {
          attributeName: lowerCased,
          attributeNamespace: null,
          propertyName: propName,
          mutationMethod: null,
          mustUseAttribute: checkMask(propConfig, Injection.MUST_USE_ATTRIBUTE),
          mustUseProperty: checkMask(propConfig, Injection.MUST_USE_PROPERTY),
          hasSideEffects: checkMask(propConfig, Injection.HAS_SIDE_EFFECTS),
          hasBooleanValue: checkMask(propConfig, Injection.HAS_BOOLEAN_VALUE),
          hasNumericValue: checkMask(propConfig, Injection.HAS_NUMERIC_VALUE),
          hasPositiveNumericValue: checkMask(propConfig, Injection.HAS_POSITIVE_NUMERIC_VALUE),
          hasOverloadedBooleanValue: checkMask(propConfig, Injection.HAS_OVERLOADED_BOOLEAN_VALUE)
        };
        !(!propertyInfo.mustUseAttribute || !propertyInfo.mustUseProperty) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'DOMProperty: Cannot require using both attribute and property: %s', propName) : invariant(false) : undefined;
        !(propertyInfo.mustUseProperty || !propertyInfo.hasSideEffects) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'DOMProperty: Properties that have side effects must use property: %s', propName) : invariant(false) : undefined;
        !(propertyInfo.hasBooleanValue + propertyInfo.hasNumericValue + propertyInfo.hasOverloadedBooleanValue <= 1) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'DOMProperty: Value can be one of boolean, overloaded boolean, or ' + 'numeric value, but not a combination: %s', propName) : invariant(false) : undefined;
        if (process.env.NODE_ENV !== 'production') {
          DOMProperty.getPossibleStandardName[lowerCased] = propName;
        }
        if (DOMAttributeNames.hasOwnProperty(propName)) {
          var attributeName = DOMAttributeNames[propName];
          propertyInfo.attributeName = attributeName;
          if (process.env.NODE_ENV !== 'production') {
            DOMProperty.getPossibleStandardName[attributeName] = propName;
          }
        }
        if (DOMAttributeNamespaces.hasOwnProperty(propName)) {
          propertyInfo.attributeNamespace = DOMAttributeNamespaces[propName];
        }
        if (DOMPropertyNames.hasOwnProperty(propName)) {
          propertyInfo.propertyName = DOMPropertyNames[propName];
        }
        if (DOMMutationMethods.hasOwnProperty(propName)) {
          propertyInfo.mutationMethod = DOMMutationMethods[propName];
        }
        DOMProperty.properties[propName] = propertyInfo;
      }
    }
  };
  var defaultValueCache = {};
  var DOMProperty = {
    ID_ATTRIBUTE_NAME: 'data-reactid',
    properties: {},
    getPossibleStandardName: process.env.NODE_ENV !== 'production' ? {} : null,
    _isCustomAttributeFunctions: [],
    isCustomAttribute: function(attributeName) {
      for (var i = 0; i < DOMProperty._isCustomAttributeFunctions.length; i++) {
        var isCustomAttributeFn = DOMProperty._isCustomAttributeFunctions[i];
        if (isCustomAttributeFn(attributeName)) {
          return true;
        }
      }
      return false;
    },
    getDefaultValueForProperty: function(nodeName, prop) {
      var nodeDefaults = defaultValueCache[nodeName];
      var testElement;
      if (!nodeDefaults) {
        defaultValueCache[nodeName] = nodeDefaults = {};
      }
      if (!(prop in nodeDefaults)) {
        testElement = document.createElement(nodeName);
        nodeDefaults[prop] = testElement[prop];
      }
      return nodeDefaults[prop];
    },
    injection: DOMPropertyInjection
  };
  module.exports = DOMProperty;
})(require("process"));
