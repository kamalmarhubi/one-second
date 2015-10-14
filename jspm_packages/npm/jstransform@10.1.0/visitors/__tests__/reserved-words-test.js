/* */ 
jest.autoMockOff();
describe('reserved-words', function() {
  var transformFn;
  var visitors;
  beforeEach(function() {
    require("mock-modules").dumpCache();
    visitors = require("../reserved-words-visitors").visitorList;
    transformFn = require("../../src/jstransform").transform;
  });
  function transform(code, opts) {
    return transformFn(visitors, code, opts).code;
  }
  describe('reserved words in member expressions', function() {
    it('should transform to reserved word members to computed', function() {
      var code = 'foo.delete;';
      expect(transform(code)).toEqual('foo["delete"];');
      code = '(foo++).delete;';
      expect(transform(code)).toEqual('(foo++)["delete"];');
    });
    it('should handle call expressions', function() {
      var code = 'foo.return();';
      expect(transform(code)).toEqual('foo["return"]();');
    });
    it('should only quote ES3 reserved words', function() {
      var code = 'foo.await();';
      expect(transform(code)).toEqual('foo.await();');
    });
  });
  describe('reserved words in properties', function() {
    it('should quote reserved words in properties', function() {
      var code = 'var x = {null: 1};';
      expect(transform(code)).toEqual('var x = {"null": 1};');
    });
    it('should only quote ES3 reserved words', function() {
      var code = 'var x = {await: 1};';
      expect(transform(code)).toEqual('var x = {await: 1};');
    });
  });
});
