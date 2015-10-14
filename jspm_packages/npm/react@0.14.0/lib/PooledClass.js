/* */ 
(function(process) {
  'use strict';
  var invariant = require("fbjs/lib/invariant");
  var oneArgumentPooler = function(copyFieldsFrom) {
    var Klass = this;
    if (Klass.instancePool.length) {
      var instance = Klass.instancePool.pop();
      Klass.call(instance, copyFieldsFrom);
      return instance;
    } else {
      return new Klass(copyFieldsFrom);
    }
  };
  var twoArgumentPooler = function(a1, a2) {
    var Klass = this;
    if (Klass.instancePool.length) {
      var instance = Klass.instancePool.pop();
      Klass.call(instance, a1, a2);
      return instance;
    } else {
      return new Klass(a1, a2);
    }
  };
  var threeArgumentPooler = function(a1, a2, a3) {
    var Klass = this;
    if (Klass.instancePool.length) {
      var instance = Klass.instancePool.pop();
      Klass.call(instance, a1, a2, a3);
      return instance;
    } else {
      return new Klass(a1, a2, a3);
    }
  };
  var fourArgumentPooler = function(a1, a2, a3, a4) {
    var Klass = this;
    if (Klass.instancePool.length) {
      var instance = Klass.instancePool.pop();
      Klass.call(instance, a1, a2, a3, a4);
      return instance;
    } else {
      return new Klass(a1, a2, a3, a4);
    }
  };
  var fiveArgumentPooler = function(a1, a2, a3, a4, a5) {
    var Klass = this;
    if (Klass.instancePool.length) {
      var instance = Klass.instancePool.pop();
      Klass.call(instance, a1, a2, a3, a4, a5);
      return instance;
    } else {
      return new Klass(a1, a2, a3, a4, a5);
    }
  };
  var standardReleaser = function(instance) {
    var Klass = this;
    !(instance instanceof Klass) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Trying to release an instance into a pool of a different type.') : invariant(false) : undefined;
    instance.destructor();
    if (Klass.instancePool.length < Klass.poolSize) {
      Klass.instancePool.push(instance);
    }
  };
  var DEFAULT_POOL_SIZE = 10;
  var DEFAULT_POOLER = oneArgumentPooler;
  var addPoolingTo = function(CopyConstructor, pooler) {
    var NewKlass = CopyConstructor;
    NewKlass.instancePool = [];
    NewKlass.getPooled = pooler || DEFAULT_POOLER;
    if (!NewKlass.poolSize) {
      NewKlass.poolSize = DEFAULT_POOL_SIZE;
    }
    NewKlass.release = standardReleaser;
    return NewKlass;
  };
  var PooledClass = {
    addPoolingTo: addPoolingTo,
    oneArgumentPooler: oneArgumentPooler,
    twoArgumentPooler: twoArgumentPooler,
    threeArgumentPooler: threeArgumentPooler,
    fourArgumentPooler: fourArgumentPooler,
    fiveArgumentPooler: fiveArgumentPooler
  };
  module.exports = PooledClass;
})(require("process"));
