/* */ 
require("mock-modules").autoMockOff();
describe('es6-object-concise-method-visitors', function() {
  var transformFn;
  var conciseMethodVisitors;
  var restParamVisitors;
  var visitors;
  beforeEach(function() {
    require("mock-modules").dumpCache();
    conciseMethodVisitors = require("../es6-object-concise-method-visitors").visitorList;
    restParamVisitors = require("../es6-rest-param-visitors").visitorList;
    transformFn = require("../../src/jstransform").transform;
    visitors = conciseMethodVisitors.concat(restParamVisitors);
  });
  function transform(code) {
    return transformFn(visitors, code).code;
  }
  function expectTransform(code, result) {
    expect(transform(code)).toEqual(result);
  }
  it('should transform concise method and return 42', function() {
    var code = transform(['var foo = {', '  bar(x) {', '    return x;', '  }', '};'].join('\n'));
    eval(code);
    expect(foo.bar(42)).toEqual(42);
  });
  it('should transform concise method with literal property', function() {
    var code = transform(['var foo = {', '  "bar 1"(x) {', '    return x;', '  }', '};'].join('\n'));
    eval(code);
    expect(foo['bar 1'](42)).toEqual(42);
  });
  it('should work with rest params', function() {
    var code = transform(['({', '  init(x, ...rest) {', '    return rest.concat(x);', '  }', '}).init(1, 2, 3);'].join('\n'));
    expect(eval(code)).toEqual([2, 3, 1]);
  });
  it('should transform concise methods', function() {
    expectTransform('var foo = {bar() {}};', 'var foo = {bar:function() {}};');
    expectTransform('({bar(x) { return {baz(y) {}}; }});', '({bar:function(x) { return {baz:function(y) {}}; }});');
  });
  it('should preserve generators', function() {
    expectTransform('var foo = {*bar(x) {yield x;}};', 'var foo = {bar:function*(x) {yield x;}};');
    expectTransform('var foo = {*"abc"(x) {yield x;}, *42(x) {yield x;}};', 'var foo = {"abc":function*(x) {yield x;}, 42:function*(x) {yield x;}};');
    expectTransform('var foo = {*[a+b](x) {yield x;}}', 'var foo = {[a+b]:function*(x) {yield x;}}');
  });
  it('should handle reserved words', function() {
    expectTransform('({delete(x) {}})', '({"delete":function(x) {}})');
  });
});
