/* */ 
(function(process) {
  'use strict';
  var ReactInstanceMap = require("./ReactInstanceMap");
  var ReactTestUtils = require("./ReactTestUtils");
  var assign = require("./Object.assign");
  var invariant = require("fbjs/lib/invariant");
  function reactComponentExpect(instance) {
    if (instance instanceof reactComponentExpectInternal) {
      return instance;
    }
    if (!(this instanceof reactComponentExpect)) {
      return new reactComponentExpect(instance);
    }
    expect(instance).not.toBeNull();
    expect(instance).not.toBeUndefined();
    !ReactTestUtils.isCompositeComponent(instance) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'reactComponentExpect(...): instance must be a composite component') : invariant(false) : undefined;
    var internalInstance = ReactInstanceMap.get(instance);
    expect(typeof internalInstance).toBe('object');
    expect(typeof internalInstance.constructor).toBe('function');
    expect(ReactTestUtils.isElement(internalInstance)).toBe(false);
    return new reactComponentExpectInternal(internalInstance);
  }
  function reactComponentExpectInternal(internalInstance) {
    this._instance = internalInstance;
  }
  assign(reactComponentExpectInternal.prototype, {
    instance: function() {
      return this._instance.getPublicInstance();
    },
    expectRenderedChild: function() {
      this.toBeCompositeComponent();
      var child = this._instance._renderedComponent;
      return new reactComponentExpectInternal(child);
    },
    expectRenderedChildAt: function(childIndex) {
      this.toBeDOMComponent();
      var renderedChildren = this._instance._renderedChildren || {};
      for (var name in renderedChildren) {
        if (!renderedChildren.hasOwnProperty(name)) {
          continue;
        }
        if (renderedChildren[name]) {
          if (renderedChildren[name]._mountIndex === childIndex) {
            return new reactComponentExpectInternal(renderedChildren[name]);
          }
        }
      }
      throw new Error('Child:' + childIndex + ' is not found');
    },
    toBeDOMComponentWithChildCount: function(count) {
      this.toBeDOMComponent();
      var renderedChildren = this._instance._renderedChildren;
      expect(renderedChildren).toBeTruthy();
      expect(Object.keys(renderedChildren).length).toBe(count);
      return this;
    },
    toBeDOMComponentWithNoChildren: function() {
      this.toBeDOMComponent();
      expect(this._instance._renderedChildren).toBeFalsy();
      return this;
    },
    toBeComponentOfType: function(constructor) {
      expect(this._instance._currentElement.type === constructor).toBe(true);
      return this;
    },
    toBeCompositeComponent: function() {
      expect(typeof this.instance() === 'object' && typeof this.instance().render === 'function').toBe(true);
      return this;
    },
    toBeCompositeComponentWithType: function(constructor) {
      this.toBeCompositeComponent();
      expect(this._instance._currentElement.type === constructor).toBe(true);
      return this;
    },
    toBeTextComponentWithValue: function(val) {
      var elementType = typeof this._instance._currentElement;
      expect(elementType === 'string' || elementType === 'number').toBe(true);
      expect(this._instance._stringText).toBe(val);
      return this;
    },
    toBeEmptyComponent: function() {
      var element = this._instance._currentElement;
      return element === null || element === false;
    },
    toBePresent: function() {
      expect(this.instance()).toBeTruthy();
      return this;
    },
    toBeDOMComponent: function() {
      expect(ReactTestUtils.isDOMComponent(this.instance())).toBe(true);
      return this;
    },
    toBeDOMComponentWithTag: function(tag) {
      this.toBeDOMComponent();
      expect(this.instance().tagName).toBe(tag.toUpperCase());
      return this;
    },
    scalarStateEqual: function(stateNameToExpectedValue) {
      expect(this.instance()).toBeTruthy();
      for (var stateName in stateNameToExpectedValue) {
        if (!stateNameToExpectedValue.hasOwnProperty(stateName)) {
          continue;
        }
        expect(this.instance().state[stateName]).toEqual(stateNameToExpectedValue[stateName]);
      }
      return this;
    },
    scalarPropsEqual: function(propNameToExpectedValue) {
      expect(this.instance()).toBeTruthy();
      for (var propName in propNameToExpectedValue) {
        if (!propNameToExpectedValue.hasOwnProperty(propName)) {
          continue;
        }
        expect(this.instance().props[propName]).toEqual(propNameToExpectedValue[propName]);
      }
      return this;
    },
    scalarContextEqual: function(contextNameToExpectedValue) {
      expect(this.instance()).toBeTruthy();
      for (var contextName in contextNameToExpectedValue) {
        if (!contextNameToExpectedValue.hasOwnProperty(contextName)) {
          continue;
        }
        expect(this.instance().context[contextName]).toEqual(contextNameToExpectedValue[contextName]);
      }
      return this;
    }
  });
  module.exports = reactComponentExpect;
})(require("process"));
