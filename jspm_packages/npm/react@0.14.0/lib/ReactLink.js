/* */ 
'use strict';
var React = require("./React");
function ReactLink(value, requestChange) {
  this.value = value;
  this.requestChange = requestChange;
}
function createLinkTypeChecker(linkType) {
  var shapes = {
    value: typeof linkType === 'undefined' ? React.PropTypes.any.isRequired : linkType.isRequired,
    requestChange: React.PropTypes.func.isRequired
  };
  return React.PropTypes.shape(shapes);
}
ReactLink.PropTypes = {link: createLinkTypeChecker};
module.exports = ReactLink;
