/* */ 
(function(process) {
  'use strict';
  var assign = require("./Object.assign");
  var invariant = require("fbjs/lib/invariant");
  var PREFIX = 'key:';
  function extractObjectFromArray(arr, keyExtractor) {
    var normalizedObj = {};
    for (var i = 0; i < arr.length; i++) {
      var item = arr[i];
      var key = keyExtractor(item);
      assertValidPublicKey(key);
      var normalizedKey = PREFIX + key;
      !!(normalizedKey in normalizedObj) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'OrderedMap: IDs returned by the key extraction function must be unique.') : invariant(false) : undefined;
      normalizedObj[normalizedKey] = item;
    }
    return normalizedObj;
  }
  function OrderedMapImpl(normalizedObj, computedLength) {
    this._normalizedObj = normalizedObj;
    this._computedPositions = null;
    this.length = computedLength;
  }
  function assertValidPublicKey(key) {
    !(key !== '' && (typeof key === 'string' || typeof key === 'number')) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'OrderedMap: Key must be non-empty, non-null string or number.') : invariant(false) : undefined;
  }
  function assertValidRangeIndices(start, length, actualLen) {
    !(typeof start === 'number' && typeof length === 'number' && length >= 0 && start >= 0 && start + length <= actualLen) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'OrderedMap: `mapRange` and `forEachRange` expect non-negative start and ' + 'length arguments within the bounds of the instance.') : invariant(false) : undefined;
  }
  function _fromNormalizedObjects(a, b) {
    !(a && a.constructor === Object && (!b || b.constructor === Object)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'OrderedMap: Corrupted instance of OrderedMap detected.') : invariant(false) : undefined;
    var newSet = {};
    var length = 0;
    var key;
    for (key in a) {
      if (a.hasOwnProperty(key)) {
        newSet[key] = a[key];
        length++;
      }
    }
    for (key in b) {
      if (b.hasOwnProperty(key)) {
        if (!(key in newSet)) {
          length++;
        }
        newSet[key] = b[key];
      }
    }
    return new OrderedMapImpl(newSet, length);
  }
  var OrderedMapMethods = {
    has: function(key) {
      assertValidPublicKey(key);
      var normalizedKey = PREFIX + key;
      return normalizedKey in this._normalizedObj;
    },
    get: function(key) {
      assertValidPublicKey(key);
      var normalizedKey = PREFIX + key;
      return this.has(key) ? this._normalizedObj[normalizedKey] : undefined;
    },
    merge: function(orderedMap) {
      !(orderedMap instanceof OrderedMapImpl) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'OrderedMap.merge(...): Expected an OrderedMap instance.') : invariant(false) : undefined;
      return _fromNormalizedObjects(this._normalizedObj, orderedMap._normalizedObj);
    },
    map: function(cb, context) {
      return this.mapRange(cb, 0, this.length, context);
    },
    mapRange: function(cb, start, length, context) {
      var thisSet = this._normalizedObj;
      var newSet = {};
      var i = 0;
      assertValidRangeIndices(start, length, this.length);
      var end = start + length - 1;
      for (var key in thisSet) {
        if (thisSet.hasOwnProperty(key)) {
          if (i >= start) {
            if (i > end) {
              break;
            }
            var item = thisSet[key];
            newSet[key] = cb.call(context, item, key.substr(PREFIX.length), i);
          }
          i++;
        }
      }
      return new OrderedMapImpl(newSet, length);
    },
    filter: function(cb, context) {
      return this.filterRange(cb, 0, this.length, context);
    },
    filterRange: function(cb, start, length, context) {
      var newSet = {};
      var newSetLength = 0;
      this.forEachRange(function(item, key, originalIndex) {
        if (cb.call(context, item, key, originalIndex)) {
          var normalizedKey = PREFIX + key;
          newSet[normalizedKey] = item;
          newSetLength++;
        }
      }, start, length);
      return new OrderedMapImpl(newSet, newSetLength);
    },
    forEach: function(cb, context) {
      this.forEachRange(cb, 0, this.length, context);
    },
    forEachRange: function(cb, start, length, context) {
      assertValidRangeIndices(start, length, this.length);
      var thisSet = this._normalizedObj;
      var i = 0;
      var end = start + length - 1;
      for (var key in thisSet) {
        if (thisSet.hasOwnProperty(key)) {
          if (i >= start) {
            if (i > end) {
              break;
            }
            var item = thisSet[key];
            cb.call(context, item, key.substr(PREFIX.length), i);
          }
          i++;
        }
      }
    },
    mapKeyRange: function(cb, startKey, endKey, context) {
      var startIndex = this.indexOfKey(startKey);
      var endIndex = this.indexOfKey(endKey);
      !(startIndex !== undefined && endIndex !== undefined) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'mapKeyRange must be given keys that are present.') : invariant(false) : undefined;
      !(endIndex >= startIndex) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'OrderedMap.mapKeyRange(...): `endKey` must not come before `startIndex`.') : invariant(false) : undefined;
      return this.mapRange(cb, startIndex, endIndex - startIndex + 1, context);
    },
    forEachKeyRange: function(cb, startKey, endKey, context) {
      var startIndex = this.indexOfKey(startKey);
      var endIndex = this.indexOfKey(endKey);
      !(startIndex !== undefined && endIndex !== undefined) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'forEachKeyRange must be given keys that are present.') : invariant(false) : undefined;
      !(endIndex >= startIndex) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'OrderedMap.forEachKeyRange(...): `endKey` must not come before ' + '`startIndex`.') : invariant(false) : undefined;
      this.forEachRange(cb, startIndex, endIndex - startIndex + 1, context);
    },
    keyAtIndex: function(pos) {
      var computedPositions = this._getOrComputePositions();
      var keyAtPos = computedPositions.keyByIndex[pos];
      return keyAtPos ? keyAtPos.substr(PREFIX.length) : undefined;
    },
    keyAfter: function(key) {
      return this.nthKeyAfter(key, 1);
    },
    keyBefore: function(key) {
      return this.nthKeyBefore(key, 1);
    },
    nthKeyAfter: function(key, n) {
      var curIndex = this.indexOfKey(key);
      !(curIndex !== undefined) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'OrderedMap.nthKeyAfter: The key `%s` does not exist in this instance.', key) : invariant(false) : undefined;
      return this.keyAtIndex(curIndex + n);
    },
    nthKeyBefore: function(key, n) {
      return this.nthKeyAfter(key, -n);
    },
    indexOfKey: function(key) {
      assertValidPublicKey(key);
      var normalizedKey = PREFIX + key;
      var computedPositions = this._getOrComputePositions();
      var computedPosition = computedPositions.indexByKey[normalizedKey];
      return computedPosition === undefined ? undefined : computedPosition;
    },
    toArray: function() {
      var result = [];
      var thisSet = this._normalizedObj;
      for (var key in thisSet) {
        if (thisSet.hasOwnProperty(key)) {
          result.push(thisSet[key]);
        }
      }
      return result;
    },
    _getOrComputePositions: function() {
      var computedPositions = this._computedPositions;
      if (!computedPositions) {
        this._computePositions();
      }
      return this._computedPositions;
    },
    _computePositions: function() {
      this._computedPositions = {
        keyByIndex: {},
        indexByKey: {}
      };
      var keyByIndex = this._computedPositions.keyByIndex;
      var indexByKey = this._computedPositions.indexByKey;
      var index = 0;
      var thisSet = this._normalizedObj;
      for (var key in thisSet) {
        if (thisSet.hasOwnProperty(key)) {
          keyByIndex[index] = key;
          indexByKey[key] = index;
          index++;
        }
      }
    }
  };
  assign(OrderedMapImpl.prototype, OrderedMapMethods);
  var OrderedMap = {
    from: function(orderedMap) {
      !(orderedMap instanceof OrderedMapImpl) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'OrderedMap.from(...): Expected an OrderedMap instance.') : invariant(false) : undefined;
      return _fromNormalizedObjects(orderedMap._normalizedObj, null);
    },
    fromArray: function(arr, keyExtractor) {
      !Array.isArray(arr) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'OrderedMap.fromArray(...): First argument must be an array.') : invariant(false) : undefined;
      !(typeof keyExtractor === 'function') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'OrderedMap.fromArray(...): Second argument must be a function used ' + 'to determine the unique key for each entry.') : invariant(false) : undefined;
      return new OrderedMapImpl(extractObjectFromArray(arr, keyExtractor), arr.length);
    }
  };
  module.exports = OrderedMap;
})(require("process"));
