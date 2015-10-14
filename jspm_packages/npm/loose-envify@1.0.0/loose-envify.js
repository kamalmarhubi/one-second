/* */ 
(function(process) {
  'use strict';
  var jsTokens = require("js-tokens");
  var stream = require("stream");
  var util = require("util");
  var jsonExtRe = /\.json$/;
  var processEnvRe = /\bprocess\.env\.[_$a-zA-Z][$\w]+\b/;
  var spaceOrCommentRe = /^(?:\s|\/[/*])/;
  module.exports = function(rootEnv) {
    rootEnv = rootEnv || process.env;
    return function(file, trOpts) {
      if (jsonExtRe.test(file)) {
        return stream.PassThrough();
      }
      var envs = trOpts ? [rootEnv, trOpts] : [rootEnv];
      return new LooseEnvify(envs);
    };
  };
  function LooseEnvify(envs) {
    stream.Transform.call(this);
    this._data = '';
    this._envs = envs;
  }
  util.inherits(LooseEnvify, stream.Transform);
  LooseEnvify.prototype._transform = function(buf, enc, cb) {
    this._data += buf;
    cb();
  };
  LooseEnvify.prototype._flush = function(cb) {
    var replaced = replace(this._data, this._envs);
    this.push(replaced);
    cb();
  };
  function replace(src, envs) {
    if (!processEnvRe.test(src)) {
      return src;
    }
    var out = '';
    var purge = envs.some(function(env) {
      return env._ && env._.indexOf('purge') !== -1;
    });
    jsTokens.lastIndex = 0;
    var parts = src.match(jsTokens);
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === 'process' && parts[i + 1] === '.' && parts[i + 2] === 'env' && parts[i + 3] === '.') {
        var prevCodeToken = getAdjacentCodeToken(-1, parts, i);
        var nextCodeToken = getAdjacentCodeToken(1, parts, i + 4);
        var replacement = getReplacementString(envs, parts[i + 4], purge);
        if (prevCodeToken !== '.' && nextCodeToken !== '.' && nextCodeToken !== '=' && typeof replacement === 'string') {
          out += replacement;
          i += 4;
          continue;
        }
      }
      out += parts[i];
    }
    return out;
  }
  function getAdjacentCodeToken(dir, parts, i) {
    while (true) {
      var part = parts[i += dir];
      if (!spaceOrCommentRe.test(part)) {
        return part;
      }
    }
  }
  function getReplacementString(envs, name, purge) {
    for (var j = 0; j < envs.length; j++) {
      var env = envs[j];
      if (typeof env[name] !== 'undefined') {
        return JSON.stringify(env[name]);
      }
    }
    if (purge) {
      return 'undefined';
    }
  }
})(require("process"));
