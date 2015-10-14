/* */ 
(function(process) {
  'use strict';
  var DOMChildrenOperations = require("./DOMChildrenOperations");
  var DOMPropertyOperations = require("./DOMPropertyOperations");
  var ReactComponentBrowserEnvironment = require("./ReactComponentBrowserEnvironment");
  var ReactMount = require("./ReactMount");
  var assign = require("./Object.assign");
  var escapeTextContentForBrowser = require("./escapeTextContentForBrowser");
  var setTextContent = require("./setTextContent");
  var validateDOMNesting = require("./validateDOMNesting");
  var ReactDOMTextComponent = function(props) {};
  assign(ReactDOMTextComponent.prototype, {
    construct: function(text) {
      this._currentElement = text;
      this._stringText = '' + text;
      this._rootNodeID = null;
      this._mountIndex = 0;
    },
    mountComponent: function(rootID, transaction, context) {
      if (process.env.NODE_ENV !== 'production') {
        if (context[validateDOMNesting.ancestorInfoContextKey]) {
          validateDOMNesting('span', null, context[validateDOMNesting.ancestorInfoContextKey]);
        }
      }
      this._rootNodeID = rootID;
      if (transaction.useCreateElement) {
        var ownerDocument = context[ReactMount.ownerDocumentContextKey];
        var el = ownerDocument.createElement('span');
        DOMPropertyOperations.setAttributeForID(el, rootID);
        ReactMount.getID(el);
        setTextContent(el, this._stringText);
        return el;
      } else {
        var escapedText = escapeTextContentForBrowser(this._stringText);
        if (transaction.renderToStaticMarkup) {
          return escapedText;
        }
        return '<span ' + DOMPropertyOperations.createMarkupForID(rootID) + '>' + escapedText + '</span>';
      }
    },
    receiveComponent: function(nextText, transaction) {
      if (nextText !== this._currentElement) {
        this._currentElement = nextText;
        var nextStringText = '' + nextText;
        if (nextStringText !== this._stringText) {
          this._stringText = nextStringText;
          var node = ReactMount.getNode(this._rootNodeID);
          DOMChildrenOperations.updateTextContent(node, nextStringText);
        }
      }
    },
    unmountComponent: function() {
      ReactComponentBrowserEnvironment.unmountIDFromEnvironment(this._rootNodeID);
    }
  });
  module.exports = ReactDOMTextComponent;
})(require("process"));
