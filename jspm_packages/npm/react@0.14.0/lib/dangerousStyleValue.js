/* */ 
'use strict';
var CSSProperty = require("./CSSProperty");
var isUnitlessNumber = CSSProperty.isUnitlessNumber;
function dangerousStyleValue(name, value) {
  var isEmpty = value == null || typeof value === 'boolean' || value === '';
  if (isEmpty) {
    return '';
  }
  var isNonNumeric = isNaN(value);
  if (isNonNumeric || value === 0 || isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name]) {
    return '' + value;
  }
  if (typeof value === 'string') {
    value = value.trim();
  }
  return value + 'px';
}
module.exports = dangerousStyleValue;
