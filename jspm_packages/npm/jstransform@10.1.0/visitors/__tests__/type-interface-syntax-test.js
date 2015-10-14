/* */ 
require("mock-modules").autoMockOff();
describe('static type interface syntax', function() {
  var flowSyntaxVisitors;
  var jstransform;
  beforeEach(function() {
    require("mock-modules").dumpCache();
    flowSyntaxVisitors = require("../type-syntax").visitorList;
    jstransform = require("../../src/jstransform");
  });
  function transform(code, visitors) {
    code = jstransform.transform(flowSyntaxVisitors, code.join('\n')).code;
    if (visitors) {
      code = jstransform.transform(visitors, code).code;
    }
    return code;
  }
  describe('Interface Declaration', () => {
    it('strips interface declarations', () => {
      var code = transform(['var interface = 42;', 'interface A { foo: () => number; }', 'if (true) interface += 42;', 'interface A<T> extends B, C<T> { foo: () => number; }', 'interface += 42;']);
      eval(code);
      expect(interface).toBe(126);
    });
    it('catches up correctly', () => {
      var code = transform(["var X = require('X');", 'interface A { foo: () => number; }']);
      expect(code).toBe(["var X = require('X');", '                                  '].join('\n'));
    });
  });
});
