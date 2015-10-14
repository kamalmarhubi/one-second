/* */ 
(function(process) {
  'use strict';
  var invariant = require("./invariant");
  var CSSCore = {
    addClass: function(element, className) {
      !!/\s/.test(className) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'CSSCore.addClass takes only a single class name. "%s" contains ' + 'multiple classes.', className) : invariant(false) : undefined;
      if (className) {
        if (element.classList) {
          element.classList.add(className);
        } else if (!CSSCore.hasClass(element, className)) {
          element.className = element.className + ' ' + className;
        }
      }
      return element;
    },
    removeClass: function(element, className) {
      !!/\s/.test(className) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'CSSCore.removeClass takes only a single class name. "%s" contains ' + 'multiple classes.', className) : invariant(false) : undefined;
      if (className) {
        if (element.classList) {
          element.classList.remove(className);
        } else if (CSSCore.hasClass(element, className)) {
          element.className = element.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)', 'g'), '$1').replace(/\s+/g, ' ').replace(/^\s*|\s*$/g, '');
        }
      }
      return element;
    },
    conditionClass: function(element, className, bool) {
      return (bool ? CSSCore.addClass : CSSCore.removeClass)(element, className);
    },
    hasClass: function(element, className) {
      !!/\s/.test(className) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'CSS.hasClass takes only a single class name.') : invariant(false) : undefined;
      if (element.classList) {
        return !!className && element.classList.contains(className);
      }
      return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
    }
  };
  module.exports = CSSCore;
})(require("process"));
