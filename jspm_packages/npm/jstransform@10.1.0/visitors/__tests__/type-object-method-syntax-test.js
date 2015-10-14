/* */ 
require("mock-modules").autoMockOff();
describe('static type object-method syntax', function() {
  var flowSyntaxVisitors;
  var jstransform;
  var visitorList;
  beforeEach(function() {
    require("mock-modules").dumpCache();
    flowSyntaxVisitors = require("../type-syntax").visitorList;
    jstransform = require("../../src/jstransform");
    objMethodVisitors = require("../es6-object-concise-method-visitors");
    visitorList = objMethodVisitors.visitorList;
  });
  function transform(code, visitors) {
    visitors = visitors ? visitorList.concat(visitors) : visitorList;
    code = jstransform.transform(flowSyntaxVisitors, code.join('\n')).code;
    code = jstransform.transform(visitors, code).code;
    return code;
  }
  describe('param type annotations', () => {
    it('strips single param annotation', () => {
      var code = transform(['var foo = {', '  bar(param1: bool) {', '    return param1;', '  }', '};']);
      eval(code);
      expect(foo.bar(42)).toBe(42);
    });
    it('strips multiple param annotations', () => {
      var code = transform(['var foo = {', '  bar(param1: bool, param2: number) {', '    return [param1, param2];', '  }', '};']);
      eval(code);
      expect(foo.bar(true, 42)).toEqual([true, 42]);
    });
    it('strips higher-order param annotations', () => {
      var code = transform(['var foo = {', '  bar(param1: (_:bool) => number) {', '    return param1;', '  }', '};']);
      eval(code);
      var callback = function(param) {
        return param ? 42 : 0;
      };
      expect(foo.bar(callback)).toBe(callback);
    });
    it('strips annotated params next to non-annotated params', () => {
      var code = transform(['var foo = {', '  bar(param1, param2: number) {', '    return [param1, param2];', '  }', '}']);
      eval(code);
      expect(foo.bar('p1', 42)).toEqual(['p1', 42]);
    });
    it('strips annotated params before a rest parameter', () => {
      var restParamVisitors = require("../es6-rest-param-visitors").visitorList;
      var code = transform(['var foo = {', '  bar(param1: number, ...args) {', '    return [param1, args];', '  }', '}'], restParamVisitors);
      eval(code);
      expect(foo.bar(42, 43, 44)).toEqual([42, [43, 44]]);
    });
    it('strips annotated rest parameter', () => {
      var restParamVisitors = require("../es6-rest-param-visitors").visitorList;
      var code = transform(['var foo = {', '  bar(param1: number, ...args: Array<number>): Array<any> {', '    return [param1, args];', '  }', '}'], restParamVisitors);
      eval(code);
      expect(foo.bar(42, 43, 44)).toEqual([42, [43, 44]]);
    });
  });
  describe('return type annotations', () => {
    it('strips function return types', () => {
      var code = transform(['var foo = {', '  bar(param1:number): () => number {', '    return function() { return param1; };', '  }', '}']);
      eval(code);
      expect(foo.bar(42)()).toBe(42);
    });
  });
  describe('parametric type annotation', () => {});
});
