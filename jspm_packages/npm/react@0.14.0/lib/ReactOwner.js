/* */ 
(function(process) {
  'use strict';
  var invariant = require("fbjs/lib/invariant");
  var ReactOwner = {
    isValidOwner: function(object) {
      return !!(object && typeof object.attachRef === 'function' && typeof object.detachRef === 'function');
    },
    addComponentAsRefTo: function(component, ref, owner) {
      !ReactOwner.isValidOwner(owner) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'addComponentAsRefTo(...): Only a ReactOwner can have refs. You might ' + 'be adding a ref to a component that was not created inside a component\'s ' + '`render` method, or you have multiple copies of React loaded ' + '(details: https://fb.me/react-refs-must-have-owner).') : invariant(false) : undefined;
      owner.attachRef(ref, component);
    },
    removeComponentAsRefFrom: function(component, ref, owner) {
      !ReactOwner.isValidOwner(owner) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'removeComponentAsRefFrom(...): Only a ReactOwner can have refs. You might ' + 'be removing a ref to a component that was not created inside a component\'s ' + '`render` method, or you have multiple copies of React loaded ' + '(details: https://fb.me/react-refs-must-have-owner).') : invariant(false) : undefined;
      if (owner.getPublicInstance().refs[ref] === component.getPublicInstance()) {
        owner.detachRef(ref);
      }
    }
  };
  module.exports = ReactOwner;
})(require("process"));
