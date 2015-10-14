/* */ 
(function(process) {
  'use strict';
  var ReactElement = require("./ReactElement");
  var ReactPropTypeLocations = require("./ReactPropTypeLocations");
  var ReactPropTypeLocationNames = require("./ReactPropTypeLocationNames");
  var ReactCurrentOwner = require("./ReactCurrentOwner");
  var getIteratorFn = require("./getIteratorFn");
  var invariant = require("fbjs/lib/invariant");
  var warning = require("fbjs/lib/warning");
  function getDeclarationErrorAddendum() {
    if (ReactCurrentOwner.current) {
      var name = ReactCurrentOwner.current.getName();
      if (name) {
        return ' Check the render method of `' + name + '`.';
      }
    }
    return '';
  }
  var ownerHasKeyUseWarning = {};
  var loggedTypeFailures = {};
  function validateExplicitKey(element, parentType) {
    if (!element._store || element._store.validated || element.key != null) {
      return;
    }
    element._store.validated = true;
    var addenda = getAddendaForKeyUse('uniqueKey', element, parentType);
    if (addenda === null) {
      return;
    }
    process.env.NODE_ENV !== 'production' ? warning(false, 'Each child in an array or iterator should have a unique "key" prop.' + '%s%s%s', addenda.parentOrOwner || '', addenda.childOwner || '', addenda.url || '') : undefined;
  }
  function getAddendaForKeyUse(messageType, element, parentType) {
    var addendum = getDeclarationErrorAddendum();
    if (!addendum) {
      var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;
      if (parentName) {
        addendum = ' Check the top-level render call using <' + parentName + '>.';
      }
    }
    var memoizer = ownerHasKeyUseWarning[messageType] || (ownerHasKeyUseWarning[messageType] = {});
    if (memoizer[addendum]) {
      return null;
    }
    memoizer[addendum] = true;
    var addenda = {
      parentOrOwner: addendum,
      url: ' See https://fb.me/react-warning-keys for more information.',
      childOwner: null
    };
    if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
      addenda.childOwner = ' It was passed a child from ' + element._owner.getName() + '.';
    }
    return addenda;
  }
  function validateChildKeys(node, parentType) {
    if (typeof node !== 'object') {
      return;
    }
    if (Array.isArray(node)) {
      for (var i = 0; i < node.length; i++) {
        var child = node[i];
        if (ReactElement.isValidElement(child)) {
          validateExplicitKey(child, parentType);
        }
      }
    } else if (ReactElement.isValidElement(node)) {
      if (node._store) {
        node._store.validated = true;
      }
    } else if (node) {
      var iteratorFn = getIteratorFn(node);
      if (iteratorFn) {
        if (iteratorFn !== node.entries) {
          var iterator = iteratorFn.call(node);
          var step;
          while (!(step = iterator.next()).done) {
            if (ReactElement.isValidElement(step.value)) {
              validateExplicitKey(step.value, parentType);
            }
          }
        }
      }
    }
  }
  function checkPropTypes(componentName, propTypes, props, location) {
    for (var propName in propTypes) {
      if (propTypes.hasOwnProperty(propName)) {
        var error;
        try {
          !(typeof propTypes[propName] === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', componentName || 'React class', ReactPropTypeLocationNames[location], propName) : invariant(false) : undefined;
          error = propTypes[propName](props, propName, componentName, location);
        } catch (ex) {
          error = ex;
        }
        process.env.NODE_ENV !== 'production' ? warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', ReactPropTypeLocationNames[location], propName, typeof error) : undefined;
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          loggedTypeFailures[error.message] = true;
          var addendum = getDeclarationErrorAddendum();
          process.env.NODE_ENV !== 'production' ? warning(false, 'Failed propType: %s%s', error.message, addendum) : undefined;
        }
      }
    }
  }
  function validatePropTypes(element) {
    var componentClass = element.type;
    if (typeof componentClass !== 'function') {
      return;
    }
    var name = componentClass.displayName || componentClass.name;
    if (componentClass.propTypes) {
      checkPropTypes(name, componentClass.propTypes, element.props, ReactPropTypeLocations.prop);
    }
    if (typeof componentClass.getDefaultProps === 'function') {
      process.env.NODE_ENV !== 'production' ? warning(componentClass.getDefaultProps.isReactClassApproved, 'getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.') : undefined;
    }
  }
  var ReactElementValidator = {
    createElement: function(type, props, children) {
      var validType = typeof type === 'string' || typeof type === 'function';
      process.env.NODE_ENV !== 'production' ? warning(validType, 'React.createElement: type should not be null, undefined, boolean, or ' + 'number. It should be a string (for DOM elements) or a ReactClass ' + '(for composite components).%s', getDeclarationErrorAddendum()) : undefined;
      var element = ReactElement.createElement.apply(this, arguments);
      if (element == null) {
        return element;
      }
      if (validType) {
        for (var i = 2; i < arguments.length; i++) {
          validateChildKeys(arguments[i], type);
        }
      }
      validatePropTypes(element);
      return element;
    },
    createFactory: function(type) {
      var validatedFactory = ReactElementValidator.createElement.bind(null, type);
      validatedFactory.type = type;
      if (process.env.NODE_ENV !== 'production') {
        try {
          Object.defineProperty(validatedFactory, 'type', {
            enumerable: false,
            get: function() {
              process.env.NODE_ENV !== 'production' ? warning(false, 'Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.') : undefined;
              Object.defineProperty(this, 'type', {value: type});
              return type;
            }
          });
        } catch (x) {}
      }
      return validatedFactory;
    },
    cloneElement: function(element, props, children) {
      var newElement = ReactElement.cloneElement.apply(this, arguments);
      for (var i = 2; i < arguments.length; i++) {
        validateChildKeys(arguments[i], newElement.type);
      }
      validatePropTypes(newElement);
      return newElement;
    }
  };
  module.exports = ReactElementValidator;
})(require("process"));
