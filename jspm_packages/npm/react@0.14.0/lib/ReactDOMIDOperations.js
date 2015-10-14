/* */ 
(function(process) {
  'use strict';
  var DOMChildrenOperations = require("./DOMChildrenOperations");
  var DOMPropertyOperations = require("./DOMPropertyOperations");
  var ReactMount = require("./ReactMount");
  var ReactPerf = require("./ReactPerf");
  var invariant = require("fbjs/lib/invariant");
  var INVALID_PROPERTY_ERRORS = {
    dangerouslySetInnerHTML: '`dangerouslySetInnerHTML` must be set using `updateInnerHTMLByID()`.',
    style: '`style` must be set using `updateStylesByID()`.'
  };
  var ReactDOMIDOperations = {
    updatePropertyByID: function(id, name, value) {
      var node = ReactMount.getNode(id);
      !!INVALID_PROPERTY_ERRORS.hasOwnProperty(name) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'updatePropertyByID(...): %s', INVALID_PROPERTY_ERRORS[name]) : invariant(false) : undefined;
      if (value != null) {
        DOMPropertyOperations.setValueForProperty(node, name, value);
      } else {
        DOMPropertyOperations.deleteValueForProperty(node, name);
      }
    },
    dangerouslyReplaceNodeWithMarkupByID: function(id, markup) {
      var node = ReactMount.getNode(id);
      DOMChildrenOperations.dangerouslyReplaceNodeWithMarkup(node, markup);
    },
    dangerouslyProcessChildrenUpdates: function(updates, markup) {
      for (var i = 0; i < updates.length; i++) {
        updates[i].parentNode = ReactMount.getNode(updates[i].parentID);
      }
      DOMChildrenOperations.processUpdates(updates, markup);
    }
  };
  ReactPerf.measureMethods(ReactDOMIDOperations, 'ReactDOMIDOperations', {
    dangerouslyReplaceNodeWithMarkupByID: 'dangerouslyReplaceNodeWithMarkupByID',
    dangerouslyProcessChildrenUpdates: 'dangerouslyProcessChildrenUpdates'
  });
  module.exports = ReactDOMIDOperations;
})(require("process"));
