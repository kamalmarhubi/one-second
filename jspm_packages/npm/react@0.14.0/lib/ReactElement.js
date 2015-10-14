/* */ 
(function(process) {
  'use strict';
  var ReactCurrentOwner = require("./ReactCurrentOwner");
  var assign = require("./Object.assign");
  var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol['for'] && Symbol['for']('react.element') || 0xeac7;
  var RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true
  };
  var canDefineProperty = false;
  if (process.env.NODE_ENV !== 'production') {
    try {
      Object.defineProperty({}, 'x', {});
      canDefineProperty = true;
    } catch (x) {}
  }
  var ReactElement = function(type, key, ref, self, source, owner, props) {
    var element = {
      $$typeof: REACT_ELEMENT_TYPE,
      type: type,
      key: key,
      ref: ref,
      props: props,
      _owner: owner
    };
    if (process.env.NODE_ENV !== 'production') {
      element._store = {};
      if (canDefineProperty) {
        Object.defineProperty(element._store, 'validated', {
          configurable: false,
          enumerable: false,
          writable: true,
          value: false
        });
        Object.defineProperty(element, '_self', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: self
        });
        Object.defineProperty(element, '_source', {
          configurable: false,
          enumerable: false,
          writable: false,
          value: source
        });
      } else {
        element._store.validated = false;
        element._self = self;
        element._source = source;
      }
      Object.freeze(element.props);
      Object.freeze(element);
    }
    return element;
  };
  ReactElement.createElement = function(type, config, children) {
    var propName;
    var props = {};
    var key = null;
    var ref = null;
    var self = null;
    var source = null;
    if (config != null) {
      ref = config.ref === undefined ? null : config.ref;
      key = config.key === undefined ? null : '' + config.key;
      self = config.__self === undefined ? null : config.__self;
      source = config.__source === undefined ? null : config.__source;
      for (propName in config) {
        if (config.hasOwnProperty(propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
          props[propName] = config[propName];
        }
      }
    }
    var childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      var childArray = Array(childrenLength);
      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }
      props.children = childArray;
    }
    if (type && type.defaultProps) {
      var defaultProps = type.defaultProps;
      for (propName in defaultProps) {
        if (typeof props[propName] === 'undefined') {
          props[propName] = defaultProps[propName];
        }
      }
    }
    return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
  };
  ReactElement.createFactory = function(type) {
    var factory = ReactElement.createElement.bind(null, type);
    factory.type = type;
    return factory;
  };
  ReactElement.cloneAndReplaceKey = function(oldElement, newKey) {
    var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
    return newElement;
  };
  ReactElement.cloneAndReplaceProps = function(oldElement, newProps) {
    var newElement = ReactElement(oldElement.type, oldElement.key, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, newProps);
    if (process.env.NODE_ENV !== 'production') {
      newElement._store.validated = oldElement._store.validated;
    }
    return newElement;
  };
  ReactElement.cloneElement = function(element, config, children) {
    var propName;
    var props = assign({}, element.props);
    var key = element.key;
    var ref = element.ref;
    var self = element._self;
    var source = element._source;
    var owner = element._owner;
    if (config != null) {
      if (config.ref !== undefined) {
        ref = config.ref;
        owner = ReactCurrentOwner.current;
      }
      if (config.key !== undefined) {
        key = '' + config.key;
      }
      for (propName in config) {
        if (config.hasOwnProperty(propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
          props[propName] = config[propName];
        }
      }
    }
    var childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      var childArray = Array(childrenLength);
      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 2];
      }
      props.children = childArray;
    }
    return ReactElement(element.type, key, ref, self, source, owner, props);
  };
  ReactElement.isValidElement = function(object) {
    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
  };
  module.exports = ReactElement;
})(require("process"));
