/* */ 
'use strict';
var ReactMount = require("./ReactMount");
var findDOMNode = require("./findDOMNode");
var focusNode = require("fbjs/lib/focusNode");
var Mixin = {componentDidMount: function() {
    if (this.props.autoFocus) {
      focusNode(findDOMNode(this));
    }
  }};
var AutoFocusUtils = {
  Mixin: Mixin,
  focusDOMComponent: function() {
    focusNode(ReactMount.getNode(this._rootNodeID));
  }
};
module.exports = AutoFocusUtils;
