/* */ 
'use strict';
var PooledClass = require("./PooledClass");
var assign = require("./Object.assign");
var getTextContentAccessor = require("./getTextContentAccessor");
function FallbackCompositionState(root) {
  this._root = root;
  this._startText = this.getText();
  this._fallbackText = null;
}
assign(FallbackCompositionState.prototype, {
  destructor: function() {
    this._root = null;
    this._startText = null;
    this._fallbackText = null;
  },
  getText: function() {
    if ('value' in this._root) {
      return this._root.value;
    }
    return this._root[getTextContentAccessor()];
  },
  getData: function() {
    if (this._fallbackText) {
      return this._fallbackText;
    }
    var start;
    var startValue = this._startText;
    var startLength = startValue.length;
    var end;
    var endValue = this.getText();
    var endLength = endValue.length;
    for (start = 0; start < startLength; start++) {
      if (startValue[start] !== endValue[start]) {
        break;
      }
    }
    var minEnd = startLength - start;
    for (end = 1; end <= minEnd; end++) {
      if (startValue[startLength - end] !== endValue[endLength - end]) {
        break;
      }
    }
    var sliceTail = end > 1 ? 1 - end : undefined;
    this._fallbackText = endValue.slice(start, sliceTail);
    return this._fallbackText;
  }
});
PooledClass.addPoolingTo(FallbackCompositionState);
module.exports = FallbackCompositionState;
