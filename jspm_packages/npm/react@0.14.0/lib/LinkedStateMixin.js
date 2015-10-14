/* */ 
'use strict';
var ReactLink = require("./ReactLink");
var ReactStateSetters = require("./ReactStateSetters");
var LinkedStateMixin = {linkState: function(key) {
    return new ReactLink(this.state[key], ReactStateSetters.createStateKeySetter(this, key));
  }};
module.exports = LinkedStateMixin;
