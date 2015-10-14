/* */ 
(function(process) {
  'use strict';
  var ReactDOMIDOperations = require("./ReactDOMIDOperations");
  var ReactMount = require("./ReactMount");
  var ReactComponentBrowserEnvironment = {
    processChildrenUpdates: ReactDOMIDOperations.dangerouslyProcessChildrenUpdates,
    replaceNodeWithMarkupByID: ReactDOMIDOperations.dangerouslyReplaceNodeWithMarkupByID,
    unmountIDFromEnvironment: function(rootNodeID) {
      ReactMount.purgeID(rootNodeID);
    }
  };
  module.exports = ReactComponentBrowserEnvironment;
})(require("process"));
