/* */ 
require("mock-modules").autoMockOff();
describe('static type pattern syntax', function() {
  var flowSyntaxVisitors;
  var jstransform;
  beforeEach(function() {
    require("mock-modules").dumpCache();
    flowSyntaxVisitors = require("../type-syntax").visitorList;
    jstransform = require("../../src/jstransform");
    destructuringVisitors = require("../es6-destructuring-visitors");
    visitorList = destructuringVisitors.visitorList;
  });
  function transform(code, visitors) {
    visitors = visitors ? visitorList.concat(visitors) : visitorList;
    code = jstransform.transform(flowSyntaxVisitors, code.join('\n')).code;
    code = jstransform.transform(visitors, code).code;
    return code;
  }
  describe('Object Pattern', () => {
    it('strips function argument type annotation', () => {
      var code = transform(['function foo({x, y}: {x: number; y: number}) { return x+y; }', 'var thirty = foo({x: 10, y: 20});']);
      eval(code);
      expect(thirty).toBe(30);
    });
    it('strips var declaration type annotation', () => {
      var code = transform(['var {x, y}: {x: number; y: string} = { x: 42, y: "hello" };']);
      eval(code);
      expect(x).toBe(42);
      expect(y).toBe("hello");
    });
  });
  describe('Array Pattern', () => {
    it('strips function argument type annotation', () => {
      var code = transform(['function foo([x, y]: Array<number>) { return x+y; }', 'var thirty = foo([10, 20]);']);
      eval(code);
      expect(thirty).toBe(30);
    });
    it('strips var declaration type annotation', () => {
      var code = transform(['var [x, y]: Array<number> = [42, "hello"];']);
      eval(code);
      expect(x).toBe(42);
      expect(y).toBe("hello");
    });
  });
});
