/* */ 
var assert = require('assert');
var elliptic = require('../lib/elliptic');
var utils = elliptic.utils;
var hash = require('hash.js');
describe('Hmac_DRBG', function() {
  it('should support hmac-drbg-sha256', function() {
    function doDrbg(opt) {
      var drbg = elliptic.hmacDRBG({
        hash: hash.sha256,
        entropy: opt.entropy,
        nonce: opt.nonce,
        pers: opt.pers
      });
      return drbg.generate(opt.size, 'hex');
    }
    var test = [{
      entropy: 'totally random0123456789',
      nonce: 'secret nonce',
      pers: 'my drbg',
      size: 32,
      res: '018ec5f8e08c41e5ac974eb129ac297c5388ee1864324fa13d9b15cf98d9a157'
    }, {
      entropy: 'totally random0123456789',
      nonce: 'secret nonce',
      pers: null,
      size: 32,
      res: 'ed5d61ecf0ef38258e62f03bbb49f19f2cd07ba5145a840d83b134d5963b3633'
    }];
    for (var i = 0; i < test.length; i++)
      assert.equal(doDrbg(test[i]), test[i].res);
  });
  describe('NIST vector', function() {
    function test(opt) {
      it('should not fail at ' + opt.name, function() {
        var drbg = elliptic.hmacDRBG({
          hash: hash.sha256,
          entropy: opt.entropy,
          entropyEnc: 'hex',
          nonce: opt.nonce,
          nonceEnc: 'hex',
          pers: opt.pers,
          persEnc: 'hex'
        });
        for (var i = 0; i < opt.add.length; i++) {
          var last = drbg.generate(opt.expected.length / 2, 'hex', opt.add[i], 'hex');
        }
        assert.equal(last, opt.expected);
      });
    }
    var vector = function() {}.toString().replace(/^function.*\/\*|\*\/}/g, '').split(/\n\n/g);
    vector.forEach(function(item) {
      var lines = item.split(/\n/g);
      var opt = null;
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        var match = line.match(/(COUNT|Entropy|Non|Per|Add|Ret)\w*\s*=\s*([\w\d]*)/);
        if (!match)
          continue;
        var key = match[1];
        var value = match[2] || null;
        if (key === 'COUNT') {
          opt = {
            name: value,
            entropy: null,
            nonce: null,
            pers: null,
            add: [],
            expected: null
          };
        } else if (key === 'Entropy') {
          opt.entropy = value;
        } else if (key === 'Non') {
          opt.nonce = value;
        } else if (key === 'Per') {
          opt.pers = value;
        } else if (key === 'Add') {
          if (value && opt.add.length === 0)
            opt.name += ' with additional data';
          opt.add.push(value);
        } else if (key === 'Ret') {
          opt.expected = value;
          test(opt);
          opt = null;
        }
      }
    });
  });
});
