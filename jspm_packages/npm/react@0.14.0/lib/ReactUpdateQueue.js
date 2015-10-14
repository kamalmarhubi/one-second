/* */ 
(function(process) {
  'use strict';
  var ReactCurrentOwner = require("./ReactCurrentOwner");
  var ReactElement = require("./ReactElement");
  var ReactInstanceMap = require("./ReactInstanceMap");
  var ReactUpdates = require("./ReactUpdates");
  var assign = require("./Object.assign");
  var invariant = require("fbjs/lib/invariant");
  var warning = require("fbjs/lib/warning");
  function enqueueUpdate(internalInstance) {
    ReactUpdates.enqueueUpdate(internalInstance);
  }
  function getInternalInstanceReadyForUpdate(publicInstance, callerName) {
    var internalInstance = ReactInstanceMap.get(publicInstance);
    if (!internalInstance) {
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(!callerName, '%s(...): Can only update a mounted or mounting component. ' + 'This usually means you called %s() on an unmounted component. ' + 'This is a no-op. Please check the code for the %s component.', callerName, callerName, publicInstance.constructor.displayName) : undefined;
      }
      return null;
    }
    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(ReactCurrentOwner.current == null, '%s(...): Cannot update during an existing state transition ' + '(such as within `render`). Render methods should be a pure function ' + 'of props and state.', callerName) : undefined;
    }
    return internalInstance;
  }
  var ReactUpdateQueue = {
    isMounted: function(publicInstance) {
      if (process.env.NODE_ENV !== 'production') {
        var owner = ReactCurrentOwner.current;
        if (owner !== null) {
          process.env.NODE_ENV !== 'production' ? warning(owner._warnedAboutRefsInRender, '%s is accessing isMounted inside its render() function. ' + 'render() should be a pure function of props and state. It should ' + 'never access something that requires stale data from the previous ' + 'render, such as refs. Move this logic to componentDidMount and ' + 'componentDidUpdate instead.', owner.getName() || 'A component') : undefined;
          owner._warnedAboutRefsInRender = true;
        }
      }
      var internalInstance = ReactInstanceMap.get(publicInstance);
      if (internalInstance) {
        return !!internalInstance._renderedComponent;
      } else {
        return false;
      }
    },
    enqueueCallback: function(publicInstance, callback) {
      !(typeof callback === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'enqueueCallback(...): You called `setProps`, `replaceProps`, ' + '`setState`, `replaceState`, or `forceUpdate` with a callback that ' + 'isn\'t callable.') : invariant(false) : undefined;
      var internalInstance = getInternalInstanceReadyForUpdate(publicInstance);
      if (!internalInstance) {
        return null;
      }
      if (internalInstance._pendingCallbacks) {
        internalInstance._pendingCallbacks.push(callback);
      } else {
        internalInstance._pendingCallbacks = [callback];
      }
      enqueueUpdate(internalInstance);
    },
    enqueueCallbackInternal: function(internalInstance, callback) {
      !(typeof callback === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'enqueueCallback(...): You called `setProps`, `replaceProps`, ' + '`setState`, `replaceState`, or `forceUpdate` with a callback that ' + 'isn\'t callable.') : invariant(false) : undefined;
      if (internalInstance._pendingCallbacks) {
        internalInstance._pendingCallbacks.push(callback);
      } else {
        internalInstance._pendingCallbacks = [callback];
      }
      enqueueUpdate(internalInstance);
    },
    enqueueForceUpdate: function(publicInstance) {
      var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'forceUpdate');
      if (!internalInstance) {
        return;
      }
      internalInstance._pendingForceUpdate = true;
      enqueueUpdate(internalInstance);
    },
    enqueueReplaceState: function(publicInstance, completeState) {
      var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'replaceState');
      if (!internalInstance) {
        return;
      }
      internalInstance._pendingStateQueue = [completeState];
      internalInstance._pendingReplaceState = true;
      enqueueUpdate(internalInstance);
    },
    enqueueSetState: function(publicInstance, partialState) {
      var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'setState');
      if (!internalInstance) {
        return;
      }
      var queue = internalInstance._pendingStateQueue || (internalInstance._pendingStateQueue = []);
      queue.push(partialState);
      enqueueUpdate(internalInstance);
    },
    enqueueSetProps: function(publicInstance, partialProps) {
      var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'setProps');
      if (!internalInstance) {
        return;
      }
      ReactUpdateQueue.enqueueSetPropsInternal(internalInstance, partialProps);
    },
    enqueueSetPropsInternal: function(internalInstance, partialProps) {
      var topLevelWrapper = internalInstance._topLevelWrapper;
      !topLevelWrapper ? process.env.NODE_ENV !== 'production' ? invariant(false, 'setProps(...): You called `setProps` on a ' + 'component with a parent. This is an anti-pattern since props will ' + 'get reactively updated when rendered. Instead, change the owner\'s ' + '`render` method to pass the correct value as props to the component ' + 'where it is created.') : invariant(false) : undefined;
      var wrapElement = topLevelWrapper._pendingElement || topLevelWrapper._currentElement;
      var element = wrapElement.props;
      var props = assign({}, element.props, partialProps);
      topLevelWrapper._pendingElement = ReactElement.cloneAndReplaceProps(wrapElement, ReactElement.cloneAndReplaceProps(element, props));
      enqueueUpdate(topLevelWrapper);
    },
    enqueueReplaceProps: function(publicInstance, props) {
      var internalInstance = getInternalInstanceReadyForUpdate(publicInstance, 'replaceProps');
      if (!internalInstance) {
        return;
      }
      ReactUpdateQueue.enqueueReplacePropsInternal(internalInstance, props);
    },
    enqueueReplacePropsInternal: function(internalInstance, props) {
      var topLevelWrapper = internalInstance._topLevelWrapper;
      !topLevelWrapper ? process.env.NODE_ENV !== 'production' ? invariant(false, 'replaceProps(...): You called `replaceProps` on a ' + 'component with a parent. This is an anti-pattern since props will ' + 'get reactively updated when rendered. Instead, change the owner\'s ' + '`render` method to pass the correct value as props to the component ' + 'where it is created.') : invariant(false) : undefined;
      var wrapElement = topLevelWrapper._pendingElement || topLevelWrapper._currentElement;
      var element = wrapElement.props;
      topLevelWrapper._pendingElement = ReactElement.cloneAndReplaceProps(wrapElement, ReactElement.cloneAndReplaceProps(element, props));
      enqueueUpdate(topLevelWrapper);
    },
    enqueueElementInternal: function(internalInstance, newElement) {
      internalInstance._pendingElement = newElement;
      enqueueUpdate(internalInstance);
    }
  };
  module.exports = ReactUpdateQueue;
})(require("process"));
