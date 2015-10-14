/* */ 
(function(process) {
  'use strict';
  var DOMProperty = require("./DOMProperty");
  var ReactBrowserEventEmitter = require("./ReactBrowserEventEmitter");
  var ReactCurrentOwner = require("./ReactCurrentOwner");
  var ReactDOMFeatureFlags = require("./ReactDOMFeatureFlags");
  var ReactElement = require("./ReactElement");
  var ReactEmptyComponentRegistry = require("./ReactEmptyComponentRegistry");
  var ReactInstanceHandles = require("./ReactInstanceHandles");
  var ReactInstanceMap = require("./ReactInstanceMap");
  var ReactMarkupChecksum = require("./ReactMarkupChecksum");
  var ReactPerf = require("./ReactPerf");
  var ReactReconciler = require("./ReactReconciler");
  var ReactUpdateQueue = require("./ReactUpdateQueue");
  var ReactUpdates = require("./ReactUpdates");
  var assign = require("./Object.assign");
  var emptyObject = require("fbjs/lib/emptyObject");
  var containsNode = require("fbjs/lib/containsNode");
  var instantiateReactComponent = require("./instantiateReactComponent");
  var invariant = require("fbjs/lib/invariant");
  var setInnerHTML = require("./setInnerHTML");
  var shouldUpdateReactComponent = require("./shouldUpdateReactComponent");
  var validateDOMNesting = require("./validateDOMNesting");
  var warning = require("fbjs/lib/warning");
  var ATTR_NAME = DOMProperty.ID_ATTRIBUTE_NAME;
  var nodeCache = {};
  var ELEMENT_NODE_TYPE = 1;
  var DOC_NODE_TYPE = 9;
  var DOCUMENT_FRAGMENT_NODE_TYPE = 11;
  var ownerDocumentContextKey = '__ReactMount_ownerDocument$' + Math.random().toString(36).slice(2);
  var instancesByReactRootID = {};
  var containersByReactRootID = {};
  if (process.env.NODE_ENV !== 'production') {
    var rootElementsByReactRootID = {};
  }
  var findComponentRootReusableArray = [];
  function firstDifferenceIndex(string1, string2) {
    var minLen = Math.min(string1.length, string2.length);
    for (var i = 0; i < minLen; i++) {
      if (string1.charAt(i) !== string2.charAt(i)) {
        return i;
      }
    }
    return string1.length === string2.length ? -1 : minLen;
  }
  function getReactRootElementInContainer(container) {
    if (!container) {
      return null;
    }
    if (container.nodeType === DOC_NODE_TYPE) {
      return container.documentElement;
    } else {
      return container.firstChild;
    }
  }
  function getReactRootID(container) {
    var rootElement = getReactRootElementInContainer(container);
    return rootElement && ReactMount.getID(rootElement);
  }
  function getID(node) {
    var id = internalGetID(node);
    if (id) {
      if (nodeCache.hasOwnProperty(id)) {
        var cached = nodeCache[id];
        if (cached !== node) {
          !!isValid(cached, id) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactMount: Two valid but unequal nodes with the same `%s`: %s', ATTR_NAME, id) : invariant(false) : undefined;
          nodeCache[id] = node;
        }
      } else {
        nodeCache[id] = node;
      }
    }
    return id;
  }
  function internalGetID(node) {
    return node && node.getAttribute && node.getAttribute(ATTR_NAME) || '';
  }
  function setID(node, id) {
    var oldID = internalGetID(node);
    if (oldID !== id) {
      delete nodeCache[oldID];
    }
    node.setAttribute(ATTR_NAME, id);
    nodeCache[id] = node;
  }
  function getNode(id) {
    if (!nodeCache.hasOwnProperty(id) || !isValid(nodeCache[id], id)) {
      nodeCache[id] = ReactMount.findReactNodeByID(id);
    }
    return nodeCache[id];
  }
  function getNodeFromInstance(instance) {
    var id = ReactInstanceMap.get(instance)._rootNodeID;
    if (ReactEmptyComponentRegistry.isNullComponentID(id)) {
      return null;
    }
    if (!nodeCache.hasOwnProperty(id) || !isValid(nodeCache[id], id)) {
      nodeCache[id] = ReactMount.findReactNodeByID(id);
    }
    return nodeCache[id];
  }
  function isValid(node, id) {
    if (node) {
      !(internalGetID(node) === id) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactMount: Unexpected modification of `%s`', ATTR_NAME) : invariant(false) : undefined;
      var container = ReactMount.findReactContainerForID(id);
      if (container && containsNode(container, node)) {
        return true;
      }
    }
    return false;
  }
  function purgeID(id) {
    delete nodeCache[id];
  }
  var deepestNodeSoFar = null;
  function findDeepestCachedAncestorImpl(ancestorID) {
    var ancestor = nodeCache[ancestorID];
    if (ancestor && isValid(ancestor, ancestorID)) {
      deepestNodeSoFar = ancestor;
    } else {
      return false;
    }
  }
  function findDeepestCachedAncestor(targetID) {
    deepestNodeSoFar = null;
    ReactInstanceHandles.traverseAncestors(targetID, findDeepestCachedAncestorImpl);
    var foundNode = deepestNodeSoFar;
    deepestNodeSoFar = null;
    return foundNode;
  }
  function mountComponentIntoNode(componentInstance, rootID, container, transaction, shouldReuseMarkup, context) {
    if (ReactDOMFeatureFlags.useCreateElement) {
      context = assign({}, context);
      if (container.nodeType === DOC_NODE_TYPE) {
        context[ownerDocumentContextKey] = container;
      } else {
        context[ownerDocumentContextKey] = container.ownerDocument;
      }
    }
    if (process.env.NODE_ENV !== 'production') {
      if (context === emptyObject) {
        context = {};
      }
      var tag = container.nodeName.toLowerCase();
      context[validateDOMNesting.ancestorInfoContextKey] = validateDOMNesting.updatedAncestorInfo(null, tag, null);
    }
    var markup = ReactReconciler.mountComponent(componentInstance, rootID, transaction, context);
    componentInstance._renderedComponent._topLevelWrapper = componentInstance;
    ReactMount._mountImageIntoNode(markup, container, shouldReuseMarkup, transaction);
  }
  function batchedMountComponentIntoNode(componentInstance, rootID, container, shouldReuseMarkup, context) {
    var transaction = ReactUpdates.ReactReconcileTransaction.getPooled(shouldReuseMarkup);
    transaction.perform(mountComponentIntoNode, null, componentInstance, rootID, container, transaction, shouldReuseMarkup, context);
    ReactUpdates.ReactReconcileTransaction.release(transaction);
  }
  function unmountComponentFromNode(instance, container) {
    ReactReconciler.unmountComponent(instance);
    if (container.nodeType === DOC_NODE_TYPE) {
      container = container.documentElement;
    }
    while (container.lastChild) {
      container.removeChild(container.lastChild);
    }
  }
  function hasNonRootReactChild(node) {
    var reactRootID = getReactRootID(node);
    return reactRootID ? reactRootID !== ReactInstanceHandles.getReactRootIDFromNodeID(reactRootID) : false;
  }
  function findFirstReactDOMImpl(node) {
    for (; node && node.parentNode !== node; node = node.parentNode) {
      if (node.nodeType !== 1) {
        continue;
      }
      var nodeID = internalGetID(node);
      if (!nodeID) {
        continue;
      }
      var reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(nodeID);
      var current = node;
      var lastID;
      do {
        lastID = internalGetID(current);
        current = current.parentNode;
        if (current == null) {
          return null;
        }
      } while (lastID !== reactRootID);
      if (current === containersByReactRootID[reactRootID]) {
        return node;
      }
    }
    return null;
  }
  var TopLevelWrapper = function() {};
  TopLevelWrapper.prototype.isReactComponent = {};
  if (process.env.NODE_ENV !== 'production') {
    TopLevelWrapper.displayName = 'TopLevelWrapper';
  }
  TopLevelWrapper.prototype.render = function() {
    return this.props;
  };
  var ReactMount = {
    TopLevelWrapper: TopLevelWrapper,
    _instancesByReactRootID: instancesByReactRootID,
    scrollMonitor: function(container, renderCallback) {
      renderCallback();
    },
    _updateRootComponent: function(prevComponent, nextElement, container, callback) {
      ReactMount.scrollMonitor(container, function() {
        ReactUpdateQueue.enqueueElementInternal(prevComponent, nextElement);
        if (callback) {
          ReactUpdateQueue.enqueueCallbackInternal(prevComponent, callback);
        }
      });
      if (process.env.NODE_ENV !== 'production') {
        rootElementsByReactRootID[getReactRootID(container)] = getReactRootElementInContainer(container);
      }
      return prevComponent;
    },
    _registerComponent: function(nextComponent, container) {
      !(container && (container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE || container.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE)) ? process.env.NODE_ENV !== 'production' ? invariant(false, '_registerComponent(...): Target container is not a DOM element.') : invariant(false) : undefined;
      ReactBrowserEventEmitter.ensureScrollValueMonitoring();
      var reactRootID = ReactMount.registerContainer(container);
      instancesByReactRootID[reactRootID] = nextComponent;
      return reactRootID;
    },
    _renderNewRootComponent: function(nextElement, container, shouldReuseMarkup, context) {
      process.env.NODE_ENV !== 'production' ? warning(ReactCurrentOwner.current == null, '_renderNewRootComponent(): Render methods should be a pure function ' + 'of props and state; triggering nested component updates from ' + 'render is not allowed. If necessary, trigger nested updates in ' + 'componentDidUpdate. Check the render method of %s.', ReactCurrentOwner.current && ReactCurrentOwner.current.getName() || 'ReactCompositeComponent') : undefined;
      var componentInstance = instantiateReactComponent(nextElement, null);
      var reactRootID = ReactMount._registerComponent(componentInstance, container);
      ReactUpdates.batchedUpdates(batchedMountComponentIntoNode, componentInstance, reactRootID, container, shouldReuseMarkup, context);
      if (process.env.NODE_ENV !== 'production') {
        rootElementsByReactRootID[reactRootID] = getReactRootElementInContainer(container);
      }
      return componentInstance;
    },
    renderSubtreeIntoContainer: function(parentComponent, nextElement, container, callback) {
      !(parentComponent != null && parentComponent._reactInternalInstance != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'parentComponent must be a valid React Component') : invariant(false) : undefined;
      return ReactMount._renderSubtreeIntoContainer(parentComponent, nextElement, container, callback);
    },
    _renderSubtreeIntoContainer: function(parentComponent, nextElement, container, callback) {
      !ReactElement.isValidElement(nextElement) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'ReactDOM.render(): Invalid component element.%s', typeof nextElement === 'string' ? ' Instead of passing an element string, make sure to instantiate ' + 'it by passing it to React.createElement.' : typeof nextElement === 'function' ? ' Instead of passing a component class, make sure to instantiate ' + 'it by passing it to React.createElement.' : nextElement != null && nextElement.props !== undefined ? ' This may be caused by unintentionally loading two independent ' + 'copies of React.' : '') : invariant(false) : undefined;
      process.env.NODE_ENV !== 'production' ? warning(!container || !container.tagName || container.tagName.toUpperCase() !== 'BODY', 'render(): Rendering components directly into document.body is ' + 'discouraged, since its children are often manipulated by third-party ' + 'scripts and browser extensions. This may lead to subtle ' + 'reconciliation issues. Try rendering into a container element created ' + 'for your app.') : undefined;
      var nextWrappedElement = new ReactElement(TopLevelWrapper, null, null, null, null, null, nextElement);
      var prevComponent = instancesByReactRootID[getReactRootID(container)];
      if (prevComponent) {
        var prevWrappedElement = prevComponent._currentElement;
        var prevElement = prevWrappedElement.props;
        if (shouldUpdateReactComponent(prevElement, nextElement)) {
          return ReactMount._updateRootComponent(prevComponent, nextWrappedElement, container, callback)._renderedComponent.getPublicInstance();
        } else {
          ReactMount.unmountComponentAtNode(container);
        }
      }
      var reactRootElement = getReactRootElementInContainer(container);
      var containerHasReactMarkup = reactRootElement && !!internalGetID(reactRootElement);
      var containerHasNonRootReactChild = hasNonRootReactChild(container);
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(!containerHasNonRootReactChild, 'render(...): Replacing React-rendered children with a new root ' + 'component. If you intended to update the children of this node, ' + 'you should instead have the existing children update their state ' + 'and render the new components instead of calling ReactDOM.render.') : undefined;
        if (!containerHasReactMarkup || reactRootElement.nextSibling) {
          var rootElementSibling = reactRootElement;
          while (rootElementSibling) {
            if (internalGetID(rootElementSibling)) {
              process.env.NODE_ENV !== 'production' ? warning(false, 'render(): Target node has markup rendered by React, but there ' + 'are unrelated nodes as well. This is most commonly caused by ' + 'white-space inserted around server-rendered markup.') : undefined;
              break;
            }
            rootElementSibling = rootElementSibling.nextSibling;
          }
        }
      }
      var shouldReuseMarkup = containerHasReactMarkup && !prevComponent && !containerHasNonRootReactChild;
      var component = ReactMount._renderNewRootComponent(nextWrappedElement, container, shouldReuseMarkup, parentComponent != null ? parentComponent._reactInternalInstance._processChildContext(parentComponent._reactInternalInstance._context) : emptyObject)._renderedComponent.getPublicInstance();
      if (callback) {
        callback.call(component);
      }
      return component;
    },
    render: function(nextElement, container, callback) {
      return ReactMount._renderSubtreeIntoContainer(null, nextElement, container, callback);
    },
    registerContainer: function(container) {
      var reactRootID = getReactRootID(container);
      if (reactRootID) {
        reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(reactRootID);
      }
      if (!reactRootID) {
        reactRootID = ReactInstanceHandles.createReactRootID();
      }
      containersByReactRootID[reactRootID] = container;
      return reactRootID;
    },
    unmountComponentAtNode: function(container) {
      process.env.NODE_ENV !== 'production' ? warning(ReactCurrentOwner.current == null, 'unmountComponentAtNode(): Render methods should be a pure function ' + 'of props and state; triggering nested component updates from render ' + 'is not allowed. If necessary, trigger nested updates in ' + 'componentDidUpdate. Check the render method of %s.', ReactCurrentOwner.current && ReactCurrentOwner.current.getName() || 'ReactCompositeComponent') : undefined;
      !(container && (container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE || container.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'unmountComponentAtNode(...): Target container is not a DOM element.') : invariant(false) : undefined;
      var reactRootID = getReactRootID(container);
      var component = instancesByReactRootID[reactRootID];
      if (!component) {
        var containerHasNonRootReactChild = hasNonRootReactChild(container);
        var containerID = internalGetID(container);
        var isContainerReactRoot = containerID && containerID === ReactInstanceHandles.getReactRootIDFromNodeID(containerID);
        if (process.env.NODE_ENV !== 'production') {
          process.env.NODE_ENV !== 'production' ? warning(!containerHasNonRootReactChild, 'unmountComponentAtNode(): The node you\'re attempting to unmount ' + 'was rendered by React and is not a top-level container. %s', isContainerReactRoot ? 'You may have accidentally passed in a React root node instead ' + 'of its container.' : 'Instead, have the parent component update its state and ' + 'rerender in order to remove this component.') : undefined;
        }
        return false;
      }
      ReactUpdates.batchedUpdates(unmountComponentFromNode, component, container);
      delete instancesByReactRootID[reactRootID];
      delete containersByReactRootID[reactRootID];
      if (process.env.NODE_ENV !== 'production') {
        delete rootElementsByReactRootID[reactRootID];
      }
      return true;
    },
    findReactContainerForID: function(id) {
      var reactRootID = ReactInstanceHandles.getReactRootIDFromNodeID(id);
      var container = containersByReactRootID[reactRootID];
      if (process.env.NODE_ENV !== 'production') {
        var rootElement = rootElementsByReactRootID[reactRootID];
        if (rootElement && rootElement.parentNode !== container) {
          process.env.NODE_ENV !== 'production' ? warning(internalGetID(rootElement) === reactRootID, 'ReactMount: Root element ID differed from reactRootID.') : undefined;
          var containerChild = container.firstChild;
          if (containerChild && reactRootID === internalGetID(containerChild)) {
            rootElementsByReactRootID[reactRootID] = containerChild;
          } else {
            process.env.NODE_ENV !== 'production' ? warning(false, 'ReactMount: Root element has been removed from its original ' + 'container. New container: %s', rootElement.parentNode) : undefined;
          }
        }
      }
      return container;
    },
    findReactNodeByID: function(id) {
      var reactRoot = ReactMount.findReactContainerForID(id);
      return ReactMount.findComponentRoot(reactRoot, id);
    },
    getFirstReactDOM: function(node) {
      return findFirstReactDOMImpl(node);
    },
    findComponentRoot: function(ancestorNode, targetID) {
      var firstChildren = findComponentRootReusableArray;
      var childIndex = 0;
      var deepestAncestor = findDeepestCachedAncestor(targetID) || ancestorNode;
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(deepestAncestor != null, 'React can\'t find the root component node for data-reactid value ' + '`%s`. If you\'re seeing this message, it probably means that ' + 'you\'ve loaded two copies of React on the page. At this time, only ' + 'a single copy of React can be loaded at a time.', targetID) : undefined;
      }
      firstChildren[0] = deepestAncestor.firstChild;
      firstChildren.length = 1;
      while (childIndex < firstChildren.length) {
        var child = firstChildren[childIndex++];
        var targetChild;
        while (child) {
          var childID = ReactMount.getID(child);
          if (childID) {
            if (targetID === childID) {
              targetChild = child;
            } else if (ReactInstanceHandles.isAncestorIDOf(childID, targetID)) {
              firstChildren.length = childIndex = 0;
              firstChildren.push(child.firstChild);
            }
          } else {
            firstChildren.push(child.firstChild);
          }
          child = child.nextSibling;
        }
        if (targetChild) {
          firstChildren.length = 0;
          return targetChild;
        }
      }
      firstChildren.length = 0;
      !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'findComponentRoot(..., %s): Unable to find element. This probably ' + 'means the DOM was unexpectedly mutated (e.g., by the browser), ' + 'usually due to forgetting a <tbody> when using tables, nesting tags ' + 'like <form>, <p>, or <a>, or using non-SVG elements in an <svg> ' + 'parent. ' + 'Try inspecting the child nodes of the element with React ID `%s`.', targetID, ReactMount.getID(ancestorNode)) : invariant(false) : undefined;
    },
    _mountImageIntoNode: function(markup, container, shouldReuseMarkup, transaction) {
      !(container && (container.nodeType === ELEMENT_NODE_TYPE || container.nodeType === DOC_NODE_TYPE || container.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'mountComponentIntoNode(...): Target container is not valid.') : invariant(false) : undefined;
      if (shouldReuseMarkup) {
        var rootElement = getReactRootElementInContainer(container);
        if (ReactMarkupChecksum.canReuseMarkup(markup, rootElement)) {
          return;
        } else {
          var checksum = rootElement.getAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);
          rootElement.removeAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME);
          var rootMarkup = rootElement.outerHTML;
          rootElement.setAttribute(ReactMarkupChecksum.CHECKSUM_ATTR_NAME, checksum);
          var normalizedMarkup = markup;
          if (process.env.NODE_ENV !== 'production') {
            var normalizer;
            if (container.nodeType === ELEMENT_NODE_TYPE) {
              normalizer = document.createElement('div');
              normalizer.innerHTML = markup;
              normalizedMarkup = normalizer.innerHTML;
            } else {
              normalizer = document.createElement('iframe');
              document.body.appendChild(normalizer);
              normalizer.contentDocument.write(markup);
              normalizedMarkup = normalizer.contentDocument.documentElement.outerHTML;
              document.body.removeChild(normalizer);
            }
          }
          var diffIndex = firstDifferenceIndex(normalizedMarkup, rootMarkup);
          var difference = ' (client) ' + normalizedMarkup.substring(diffIndex - 20, diffIndex + 20) + '\n (server) ' + rootMarkup.substring(diffIndex - 20, diffIndex + 20);
          !(container.nodeType !== DOC_NODE_TYPE) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'You\'re trying to render a component to the document using ' + 'server rendering but the checksum was invalid. This usually ' + 'means you rendered a different component type or props on ' + 'the client from the one on the server, or your render() ' + 'methods are impure. React cannot handle this case due to ' + 'cross-browser quirks by rendering at the document root. You ' + 'should look for environment dependent code in your components ' + 'and ensure the props are the same client and server side:\n%s', difference) : invariant(false) : undefined;
          if (process.env.NODE_ENV !== 'production') {
            process.env.NODE_ENV !== 'production' ? warning(false, 'React attempted to reuse markup in a container but the ' + 'checksum was invalid. This generally means that you are ' + 'using server rendering and the markup generated on the ' + 'server was not what the client was expecting. React injected ' + 'new markup to compensate which works but you have lost many ' + 'of the benefits of server rendering. Instead, figure out ' + 'why the markup being generated is different on the client ' + 'or server:\n%s', difference) : undefined;
          }
        }
      }
      !(container.nodeType !== DOC_NODE_TYPE) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'You\'re trying to render a component to the document but ' + 'you didn\'t use server rendering. We can\'t do this ' + 'without using server rendering due to cross-browser quirks. ' + 'See ReactDOMServer.renderToString() for server rendering.') : invariant(false) : undefined;
      if (transaction.useCreateElement) {
        while (container.lastChild) {
          container.removeChild(container.lastChild);
        }
        container.appendChild(markup);
      } else {
        setInnerHTML(container, markup);
      }
    },
    ownerDocumentContextKey: ownerDocumentContextKey,
    getReactRootID: getReactRootID,
    getID: getID,
    setID: setID,
    getNode: getNode,
    getNodeFromInstance: getNodeFromInstance,
    isValid: isValid,
    purgeID: purgeID
  };
  ReactPerf.measureMethods(ReactMount, 'ReactMount', {
    _renderNewRootComponent: '_renderNewRootComponent',
    _mountImageIntoNode: '_mountImageIntoNode'
  });
  module.exports = ReactMount;
})(require("process"));
