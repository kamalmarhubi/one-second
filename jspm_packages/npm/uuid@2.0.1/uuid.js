/* */ 
var _rng = require('./rng-browser');
var _byteToHex = [];
var _hexToByte = {};
for (var i = 0; i < 256; i++) {
  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
  _hexToByte[_byteToHex[i]] = i;
}
function parse(s, buf, offset) {
  var i = (buf && offset) || 0,
      ii = 0;
  buf = buf || [];
  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
    if (ii < 16) {
      buf[i + ii++] = _hexToByte[oct];
    }
  });
  while (ii < 16) {
    buf[i + ii++] = 0;
  }
  return buf;
}
function unparse(buf, offset) {
  var i = offset || 0,
      bth = _byteToHex;
  return bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]];
}
var _seedBytes = _rng();
var _nodeId = [_seedBytes[0] | 0x01, _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]];
var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;
var _lastMSecs = 0,
    _lastNSecs = 0;
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];
  options = options || {};
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs) / 10000;
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  msecs += 12219292800000;
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;
  b[i++] = tmh >>> 24 & 0xf | 0x10;
  b[i++] = tmh >>> 16 & 0xff;
  b[i++] = clockseq >>> 8 | 0x80;
  b[i++] = clockseq & 0xff;
  var node = options.node || _nodeId;
  for (var n = 0; n < 6; n++) {
    b[i + n] = node[n];
  }
  return buf ? buf : unparse(b);
}
function v4(options, buf, offset) {
  var i = buf && offset || 0;
  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};
  var rnds = options.random || (options.rng || _rng)();
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;
  if (buf) {
    for (var ii = 0; ii < 16; ii++) {
      buf[i + ii] = rnds[ii];
    }
  }
  return buf || unparse(rnds);
}
var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;
uuid.parse = parse;
uuid.unparse = unparse;
module.exports = uuid;
