/* */ 
(function(process) {
  'use strict';
  var EventConstants = require("./EventConstants");
  var EventPluginHub = require("./EventPluginHub");
  var EventPropagators = require("./EventPropagators");
  var React = require("./React");
  var ReactDOM = require("./ReactDOM");
  var ReactElement = require("./ReactElement");
  var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
  var ReactCompositeComponent = require("./ReactCompositeComponent");
  var ReactInstanceHandles = require("./ReactInstanceHandles");
  var ReactInstanceMap = require("./ReactInstanceMap");
  var ReactMount = require("./ReactMount");
  var ReactUpdates = require("./ReactUpdates");
  var SyntheticEvent = require("./SyntheticEvent");
  var assign = require("./Object.assign");
  var emptyObject = require("fbjs/lib/emptyObject");
  var findDOMNode = require("./findDOMNode");
  var invariant = require("fbjs/lib/invariant");
  var topLevelTypes = EventConstants.topLevelTypes;
  function Event(suffix) {}
  function findAllInRenderedTreeInternal(inst, test) {
    if (!inst || !inst.getPublicInstance) {
      return [];
    }
    var publicInst = inst.getPublicInstance();
    var ret = test(publicInst) ? [publicInst] : [];
    var currentElement = inst._currentElement;
    if (ReactTestUtils.isDOMComponent(publicInst)) {
      var renderedChildren = inst._renderedChildren;
      var key;
      for (key in renderedChildren) {
        if (!renderedChildren.hasOwnProperty(key)) {
          continue;
        }
        ret = ret.concat(findAllInRenderedTreeInternal(renderedChildren[key], test));
      }
    } else if (ReactElement.isValidElement(currentElement) && typeof currentElement.type === 'function') {
      ret = ret.concat(findAllInRenderedTreeInternal(inst._renderedComponent, test));
    }
    return ret;
  }
  var ReactTestUtils = {
    renderIntoDocument: function(instance) {
      var div = document.createElement('div');
      return ReactDOM.render(instance, div);
    },
    isElement: function(element) {
      return ReactElement.isValidElement(element);
    },
    isElementOfType: function(inst, convenienceConstructor) {
      return ReactElement.isValidElement(inst) && inst.type === convenienceConstructor;
    },
    isDOMComponent: function(inst) {
      return !!(inst && inst.nodeType === 1 && inst.tagName);
    },
    isDOMComponentElement: function(inst) {
      return !!(inst && ReactElement.isValidElement(inst) && !!inst.tagName);
    },
    isCompositeComponent: function(inst) {
      if (ReactTestUtils.isDOMComponent(inst)) {
        return false;
      }
      return inst != null && typeof inst.render === 'function' && typeof inst.setState === 'function';
    },
    isCompositeComponentWithType: function(inst, type) {
      if (!ReactTestUtils.isCompositeComponent(inst)) {
        return false;
      }
      var internalInstance = ReactInstanceMap.get(inst);
      var constructor = internalInstance._currentElement.type;
      return constructor === type;
    },
    isCompositeComponentElement: function(inst) {
      if (!ReactElement.isValidElement(inst)) {
        return false;
      }
      var prototype = inst.type.prototype;
      return typeof prototype.render === 'function' && typeof prototype.setState === 'function';
    },
    isCompositeComponentElementWithType: function(inst, type) {
      var internalInstance = ReactInstanceMap.get(inst);
      var constructor = internalInstance._currentElement.type;
      return !!(ReactTestUtils.isCompositeComponentElement(inst) && constructor === type);
    },
    getRenderedChildOfCompositeComponent: function(inst) {
      if (!ReactTestUtils.isCompositeComponent(inst)) {
        return null;
      }
      var internalInstance = ReactInstanceMap.get(inst);
      return internalInstance._renderedComponent.getPublicInstance();
    },
    findAllInRenderedTree: function(inst, test) {
      if (!inst) {
        return [];
      }
      !ReactTestUtils.isCompositeComponent(inst) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'findAllInRenderedTree(...): instance must be a composite component') : invariant(false) : undefined;
      return findAllInRenderedTreeInternal(ReactInstanceMap.get(inst), test);
    },
    scryRenderedDOMComponentsWithClass: function(root, classNames) {
      if (!Array.isArray(classNames)) {
        classNames = classNames.split(/\s+/);
      }
      return ReactTestUtils.findAllInRenderedTree(root, function(inst) {
        if (ReactTestUtils.isDOMComponent(inst)) {
          var classList = ReactDOM.findDOMNode(inst).className.split(/\s+/);
          return classNames.every(function(className) {
            return classList.indexOf(className) !== -1;
          });
        }
        return false;
      });
    },
    findRenderedDOMComponentWithClass: function(root, className) {
      var all = ReactTestUtils.scryRenderedDOMComponentsWithClass(root, className);
      if (all.length !== 1) {
        throw new Error('Did not find exactly one match ' + '(found: ' + all.length + ') for class:' + className);
      }
      return all[0];
    },
    scryRenderedDOMComponentsWithTag: function(root, tagName) {
      return ReactTestUtils.findAllInRenderedTree(root, function(inst) {
        return ReactTestUtils.isDOMComponent(inst) && inst.tagName.toUpperCase() === tagName.toUpperCase();
      });
    },
    findRenderedDOMComponentWithTag: function(root, tagName) {
      var all = ReactTestUtils.scryRenderedDOMComponentsWithTag(root, tagName);
      if (all.length !== 1) {
        throw new Error('Did not find exactly one match for tag:' + tagName);
      }
      return all[0];
    },
    scryRenderedComponentsWithType: function(root, componentType) {
      return ReactTestUtils.findAllInRenderedTree(root, function(inst) {
        return ReactTestUtils.isCompositeComponentWithType(inst, componentType);
      });
    },
    findRenderedComponentWithType: function(root, componentType) {
      var all = ReactTestUtils.scryRenderedComponentsWithType(root, componentType);
      if (all.length !== 1) {
        throw new Error('Did not find exactly one match for componentType:' + componentType + ' (found ' + all.length + ')');
      }
      return all[0];
    },
    mockComponent: function(module, mockTagName) {
      mockTagName = mockTagName || module.mockTagName || 'div';
      module.prototype.render.mockImplementation(function() {
        return React.createElement(mockTagName, null, this.props.children);
      });
      return this;
    },
    simulateNativeEventOnNode: function(topLevelType, node, fakeNativeEvent) {
      fakeNativeEvent.target = node;
      ReactBrowserEventEmitter.ReactEventListener.dispatchEvent(topLevelType, fakeNativeEvent);
    },
    simulateNativeEventOnDOMComponent: function(topLevelType, comp, fakeNativeEvent) {
      ReactTestUtils.simulateNativeEventOnNode(topLevelType, findDOMNode(comp), fakeNativeEvent);
    },
    nativeTouchData: function(x, y) {
      return {touches: [{
          pageX: x,
          pageY: y
        }]};
    },
    createRenderer: function() {
      return new ReactShallowRenderer();
    },
    Simulate: null,
    SimulateNative: {}
  };
  var ReactShallowRenderer = function() {
    this._instance = null;
  };
  ReactShallowRenderer.prototype.getRenderOutput = function() {
    return this._instance && this._instance._renderedComponent && this._instance._renderedComponent._renderedOutput || null;
  };
  var NoopInternalComponent = function(element) {
    this._renderedOutput = element;
    this._currentElement = element;
  };
  NoopInternalComponent.prototype = {
    mountComponent: function() {},
    receiveComponent: function(element) {
      this._renderedOutput = element;
      this._currentElement = element;
    },
    unmountComponent: function() {}
  };
  var ShallowComponentWrapper = function() {};
  assign(ShallowComponentWrapper.prototype, ReactCompositeComponent.Mixin, {
    _instantiateReactComponent: function(element) {
      return new NoopInternalComponent(element);
    },
    _replaceNodeWithMarkupByID: function() {},
    _renderValidatedComponent: ReactCompositeComponent.Mixin._renderValidatedComponentWithoutOwnerOrContext
  });
  ReactShallowRenderer.prototype.render = function(element, context) {
    !ReactElement.isValidElement(element) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactShallowRenderer render(): Invalid component element.%s', typeof element === 'function' ? ' Instead of passing a component class, make sure to instantiate ' + 'it by passing it to React.createElement.' : '') : invariant(false) : undefined;
    !(typeof element.type !== 'string') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactShallowRenderer render(): Shallow rendering works only with custom ' + 'components, not primitives (%s). Instead of calling `.render(el)` and ' + 'inspecting the rendered output, look at `el.props` directly instead.', element.type) : invariant(false) : undefined;
    if (!context) {
      context = emptyObject;
    }
    var transaction = ReactUpdates.ReactReconcileTransaction.getPooled(false);
    this._render(element, transaction, context);
    ReactUpdates.ReactReconcileTransaction.release(transaction);
  };
  ReactShallowRenderer.prototype.unmount = function() {
    if (this._instance) {
      this._instance.unmountComponent();
    }
  };
  ReactShallowRenderer.prototype._render = function(element, transaction, context) {
    if (this._instance) {
      this._instance.receiveComponent(element, transaction, context);
    } else {
      var rootID = ReactInstanceHandles.createReactRootID();
      var instance = new ShallowComponentWrapper(element.type);
      instance.construct(element);
      instance.mountComponent(rootID, transaction, context);
      this._instance = instance;
    }
  };
  function makeSimulator(eventType) {
    return function(domComponentOrNode, eventData) {
      var node;
      if (ReactTestUtils.isDOMComponent(domComponentOrNode)) {
        node = findDOMNode(domComponentOrNode);
      } else if (domComponentOrNode.tagName) {
        node = domComponentOrNode;
      }
      var dispatchConfig = ReactBrowserEventEmitter.eventNameDispatchConfigs[eventType];
      var fakeNativeEvent = new Event();
      fakeNativeEvent.target = node;
      var event = new SyntheticEvent(dispatchConfig, ReactMount.getID(node), fakeNativeEvent, node);
      assign(event, eventData);
      if (dispatchConfig.phasedRegistrationNames) {
        EventPropagators.accumulateTwoPhaseDispatches(event);
      } else {
        EventPropagators.accumulateDirectDispatches(event);
      }
      ReactUpdates.batchedUpdates(function() {
        EventPluginHub.enqueueEvents(event);
        EventPluginHub.processEventQueue(true);
      });
    };
  }
  function buildSimulators() {
    ReactTestUtils.Simulate = {};
    var eventType;
    for (eventType in ReactBrowserEventEmitter.eventNameDispatchConfigs) {
      ReactTestUtils.Simulate[eventType] = makeSimulator(eventType);
    }
  }
  var oldInjectEventPluginOrder = EventPluginHub.injection.injectEventPluginOrder;
  EventPluginHub.injection.injectEventPluginOrder = function() {
    oldInjectEventPluginOrder.apply(this, arguments);
    buildSimulators();
  };
  var oldInjectEventPlugins = EventPluginHub.injection.injectEventPluginsByName;
  EventPluginHub.injection.injectEventPluginsByName = function() {
    oldInjectEventPlugins.apply(this, arguments);
    buildSimulators();
  };
  buildSimulators();
  function makeNativeSimulator(eventType) {
    return function(domComponentOrNode, nativeEventData) {
      var fakeNativeEvent = new Event(eventType);
      assign(fakeNativeEvent, nativeEventData);
      if (ReactTestUtils.isDOMComponent(domComponentOrNode)) {
        ReactTestUtils.simulateNativeEventOnDOMComponent(eventType, domComponentOrNode, fakeNativeEvent);
      } else if (domComponentOrNode.tagName) {
        ReactTestUtils.simulateNativeEventOnNode(eventType, domComponentOrNode, fakeNativeEvent);
      }
    };
  }
  Object.keys(topLevelTypes).forEach(function(eventType) {
    var convenienceName = eventType.indexOf('top') === 0 ? eventType.charAt(3).toLowerCase() + eventType.substr(4) : eventType;
    ReactTestUtils.SimulateNative[convenienceName] = makeNativeSimulator(eventType);
  });
  module.exports = ReactTestUtils;
})(require("process"));
