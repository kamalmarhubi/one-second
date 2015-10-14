/* */ 
(function(process) {
  'use strict';
  var assign = require("./Object.assign");
  var emptyFunction = require("fbjs/lib/emptyFunction");
  var warning = require("fbjs/lib/warning");
  var validateDOMNesting = emptyFunction;
  if (process.env.NODE_ENV !== 'production') {
    var specialTags = ['address', 'applet', 'area', 'article', 'aside', 'base', 'basefont', 'bgsound', 'blockquote', 'body', 'br', 'button', 'caption', 'center', 'col', 'colgroup', 'dd', 'details', 'dir', 'div', 'dl', 'dt', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'iframe', 'img', 'input', 'isindex', 'li', 'link', 'listing', 'main', 'marquee', 'menu', 'menuitem', 'meta', 'nav', 'noembed', 'noframes', 'noscript', 'object', 'ol', 'p', 'param', 'plaintext', 'pre', 'script', 'section', 'select', 'source', 'style', 'summary', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'track', 'ul', 'wbr', 'xmp'];
    var inScopeTags = ['applet', 'caption', 'html', 'table', 'td', 'th', 'marquee', 'object', 'template', 'foreignObject', 'desc', 'title'];
    var buttonScopeTags = inScopeTags.concat(['button']);
    var impliedEndTags = ['dd', 'dt', 'li', 'option', 'optgroup', 'p', 'rp', 'rt'];
    var emptyAncestorInfo = {
      parentTag: null,
      formTag: null,
      aTagInScope: null,
      buttonTagInScope: null,
      nobrTagInScope: null,
      pTagInButtonScope: null,
      listItemTagAutoclosing: null,
      dlItemTagAutoclosing: null
    };
    var updatedAncestorInfo = function(oldInfo, tag, instance) {
      var ancestorInfo = assign({}, oldInfo || emptyAncestorInfo);
      var info = {
        tag: tag,
        instance: instance
      };
      if (inScopeTags.indexOf(tag) !== -1) {
        ancestorInfo.aTagInScope = null;
        ancestorInfo.buttonTagInScope = null;
        ancestorInfo.nobrTagInScope = null;
      }
      if (buttonScopeTags.indexOf(tag) !== -1) {
        ancestorInfo.pTagInButtonScope = null;
      }
      if (specialTags.indexOf(tag) !== -1 && tag !== 'address' && tag !== 'div' && tag !== 'p') {
        ancestorInfo.listItemTagAutoclosing = null;
        ancestorInfo.dlItemTagAutoclosing = null;
      }
      ancestorInfo.parentTag = info;
      if (tag === 'form') {
        ancestorInfo.formTag = info;
      }
      if (tag === 'a') {
        ancestorInfo.aTagInScope = info;
      }
      if (tag === 'button') {
        ancestorInfo.buttonTagInScope = info;
      }
      if (tag === 'nobr') {
        ancestorInfo.nobrTagInScope = info;
      }
      if (tag === 'p') {
        ancestorInfo.pTagInButtonScope = info;
      }
      if (tag === 'li') {
        ancestorInfo.listItemTagAutoclosing = info;
      }
      if (tag === 'dd' || tag === 'dt') {
        ancestorInfo.dlItemTagAutoclosing = info;
      }
      return ancestorInfo;
    };
    var isTagValidWithParent = function(tag, parentTag) {
      switch (parentTag) {
        case 'select':
          return tag === 'option' || tag === 'optgroup' || tag === '#text';
        case 'optgroup':
          return tag === 'option' || tag === '#text';
        case 'option':
          return tag === '#text';
        case 'tr':
          return tag === 'th' || tag === 'td' || tag === 'style' || tag === 'script' || tag === 'template';
        case 'tbody':
        case 'thead':
        case 'tfoot':
          return tag === 'tr' || tag === 'style' || tag === 'script' || tag === 'template';
        case 'colgroup':
          return tag === 'col' || tag === 'template';
        case 'table':
          return tag === 'caption' || tag === 'colgroup' || tag === 'tbody' || tag === 'tfoot' || tag === 'thead' || tag === 'style' || tag === 'script' || tag === 'template';
        case 'head':
          return tag === 'base' || tag === 'basefont' || tag === 'bgsound' || tag === 'link' || tag === 'meta' || tag === 'title' || tag === 'noscript' || tag === 'noframes' || tag === 'style' || tag === 'script' || tag === 'template';
        case 'html':
          return tag === 'head' || tag === 'body';
      }
      switch (tag) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          return parentTag !== 'h1' && parentTag !== 'h2' && parentTag !== 'h3' && parentTag !== 'h4' && parentTag !== 'h5' && parentTag !== 'h6';
        case 'rp':
        case 'rt':
          return impliedEndTags.indexOf(parentTag) === -1;
        case 'caption':
        case 'col':
        case 'colgroup':
        case 'frame':
        case 'head':
        case 'tbody':
        case 'td':
        case 'tfoot':
        case 'th':
        case 'thead':
        case 'tr':
          return parentTag == null;
      }
      return true;
    };
    var findInvalidAncestorForTag = function(tag, ancestorInfo) {
      switch (tag) {
        case 'address':
        case 'article':
        case 'aside':
        case 'blockquote':
        case 'center':
        case 'details':
        case 'dialog':
        case 'dir':
        case 'div':
        case 'dl':
        case 'fieldset':
        case 'figcaption':
        case 'figure':
        case 'footer':
        case 'header':
        case 'hgroup':
        case 'main':
        case 'menu':
        case 'nav':
        case 'ol':
        case 'p':
        case 'section':
        case 'summary':
        case 'ul':
        case 'pre':
        case 'listing':
        case 'table':
        case 'hr':
        case 'xmp':
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          return ancestorInfo.pTagInButtonScope;
        case 'form':
          return ancestorInfo.formTag || ancestorInfo.pTagInButtonScope;
        case 'li':
          return ancestorInfo.listItemTagAutoclosing;
        case 'dd':
        case 'dt':
          return ancestorInfo.dlItemTagAutoclosing;
        case 'button':
          return ancestorInfo.buttonTagInScope;
        case 'a':
          return ancestorInfo.aTagInScope;
        case 'nobr':
          return ancestorInfo.nobrTagInScope;
      }
      return null;
    };
    var findOwnerStack = function(instance) {
      if (!instance) {
        return [];
      }
      var stack = [];
      do {
        stack.push(instance);
      } while (instance = instance._currentElement._owner);
      stack.reverse();
      return stack;
    };
    var didWarn = {};
    validateDOMNesting = function(childTag, childInstance, ancestorInfo) {
      ancestorInfo = ancestorInfo || emptyAncestorInfo;
      var parentInfo = ancestorInfo.parentTag;
      var parentTag = parentInfo && parentInfo.tag;
      var invalidParent = isTagValidWithParent(childTag, parentTag) ? null : parentInfo;
      var invalidAncestor = invalidParent ? null : findInvalidAncestorForTag(childTag, ancestorInfo);
      var problematic = invalidParent || invalidAncestor;
      if (problematic) {
        var ancestorTag = problematic.tag;
        var ancestorInstance = problematic.instance;
        var childOwner = childInstance && childInstance._currentElement._owner;
        var ancestorOwner = ancestorInstance && ancestorInstance._currentElement._owner;
        var childOwners = findOwnerStack(childOwner);
        var ancestorOwners = findOwnerStack(ancestorOwner);
        var minStackLen = Math.min(childOwners.length, ancestorOwners.length);
        var i;
        var deepestCommon = -1;
        for (i = 0; i < minStackLen; i++) {
          if (childOwners[i] === ancestorOwners[i]) {
            deepestCommon = i;
          } else {
            break;
          }
        }
        var UNKNOWN = '(unknown)';
        var childOwnerNames = childOwners.slice(deepestCommon + 1).map(function(inst) {
          return inst.getName() || UNKNOWN;
        });
        var ancestorOwnerNames = ancestorOwners.slice(deepestCommon + 1).map(function(inst) {
          return inst.getName() || UNKNOWN;
        });
        var ownerInfo = [].concat(deepestCommon !== -1 ? childOwners[deepestCommon].getName() || UNKNOWN : [], ancestorOwnerNames, ancestorTag, invalidAncestor ? ['...'] : [], childOwnerNames, childTag).join(' > ');
        var warnKey = !!invalidParent + '|' + childTag + '|' + ancestorTag + '|' + ownerInfo;
        if (didWarn[warnKey]) {
          return;
        }
        didWarn[warnKey] = true;
        if (invalidParent) {
          var info = '';
          if (ancestorTag === 'table' && childTag === 'tr') {
            info += ' Add a <tbody> to your code to match the DOM tree generated by ' + 'the browser.';
          }
          process.env.NODE_ENV !== 'production' ? warning(false, 'validateDOMNesting(...): <%s> cannot appear as a child of <%s>. ' + 'See %s.%s', childTag, ancestorTag, ownerInfo, info) : undefined;
        } else {
          process.env.NODE_ENV !== 'production' ? warning(false, 'validateDOMNesting(...): <%s> cannot appear as a descendant of ' + '<%s>. See %s.', childTag, ancestorTag, ownerInfo) : undefined;
        }
      }
    };
    validateDOMNesting.ancestorInfoContextKey = '__validateDOMNesting_ancestorInfo$' + Math.random().toString(36).slice(2);
    validateDOMNesting.updatedAncestorInfo = updatedAncestorInfo;
    validateDOMNesting.isTagValidInContext = function(tag, ancestorInfo) {
      ancestorInfo = ancestorInfo || emptyAncestorInfo;
      var parentInfo = ancestorInfo.parentTag;
      var parentTag = parentInfo && parentInfo.tag;
      return isTagValidWithParent(tag, parentTag) && !findInvalidAncestorForTag(tag, ancestorInfo);
    };
  }
  module.exports = validateDOMNesting;
})(require("process"));
