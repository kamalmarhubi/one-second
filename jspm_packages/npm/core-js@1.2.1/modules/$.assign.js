/* */ 
var toObject = require("./$.to-object"),
    IObject = require("./$.iobject"),
    enumKeys = require("./$.enum-keys"),
    has = require("./$.has");
module.exports = require("./$.fails")(function() {
  var a = Object.assign,
      A = {},
      B = {},
      S = Symbol(),
      K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k) {
    B[k] = k;
  });
  return a({}, A)[S] != 7 || Object.keys(a({}, B)).join('') != K;
}) ? function assign(target, source) {
  var T = toObject(target),
      l = arguments.length,
      i = 1;
  while (l > i) {
    var S = IObject(arguments[i++]),
        keys = enumKeys(S),
        length = keys.length,
        j = 0,
        key;
    while (length > j)
      if (has(S, key = keys[j++]))
        T[key] = S[key];
  }
  return T;
} : Object.assign;
