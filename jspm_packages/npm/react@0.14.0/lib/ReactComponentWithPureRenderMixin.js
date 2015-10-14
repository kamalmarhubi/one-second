/* */ 
'use strict';
var shallowCompare = require("./shallowCompare");
var ReactComponentWithPureRenderMixin = {shouldComponentUpdate: function(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }};
module.exports = ReactComponentWithPureRenderMixin;
