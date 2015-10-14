/* */ 
require("mock-modules").autoMockOff();
describe('static type variable declaration syntax', function() {
  var flowSyntaxVisitors;
  var jstransform;
  beforeEach(function() {
    require("mock-modules").dumpCache();
    flowSyntaxVisitors = require("../type-syntax").visitorList;
    jstransform = require("../../src/jstransform");
  });
  function transform(code, visitors) {
    code = code.join('\n');
    code = jstransform.transform(flowSyntaxVisitors, code).code;
    if (visitors) {
      code = jstransform.transform(visitors, code).code;
    }
    return code;
  }
  describe('basic annotations', () => {
    it('strips single annotated declarator without initializer', () => {
      var code = transform(['var myNum = 42;', 'function foo() {', '  var myNum:number;', '  return myNum;', '}']);
      eval(code);
      expect(foo()).toBe(undefined);
    });
    it('strips single annotated declarator with initializer', () => {
      var code = transform(['var myNum:number = 42;']);
      eval(code);
      expect(myNum).toBe(42);
    });
    it('strips single annotated nullable declarator with initializer', () => {
      var code = transform(['var myNum:?number = 42;']);
      eval(code);
      expect(myNum).toBe(42);
    });
    it('strips single annotated nullable declarator without initializer', () => {
      var code = transform(['var myNum:?number;', 'myNum = null;']);
      eval(code);
      expect(myNum).toBe(null);
    });
    it('strips multiple annotation declarations without initializers', () => {
      var code = transform(['var num1 = 42;', 'var num2 = 43;', 'function foo() {', '  var num1:number, num2:number;', '  return [num1, num2];', '}']);
      eval(code);
      expect(foo()).toEqual([undefined, undefined]);
    });
    it('strips multiple annotation declarations without initializers', () => {
      var code = transform(['var num1:number = 42, num2:number = 43;']);
      eval(code);
      expect(num1).toBe(42);
      expect(num2).toBe(43);
    });
  });
  describe('function type annotations', () => {
    it('strips function type annotations without initializer', () => {
      var code = transform(['var myFunc = function() { return "NOPE"; };', 'function foo() {', '  var myFunc:(_:bool) => number;', '  return myFunc;', '}']);
      eval(code);
      expect(foo()).toBe(undefined);
    });
    it('strips function type annotations with initializer', () => {
      var code = transform(['var myFunc:(_:bool) => number = function(p1) {', '  return 42;', '};']);
      eval(code);
      expect(myFunc()).toBe(42);
    });
  });
  describe('object type annotations', () => {
    it('strips empty object type annotations without initializer', () => {
      var code = transform(['var myObj = "NOPE";', 'function foo() {', '  var myObj:{};', '  return myObj;', '}']);
      eval(code);
      expect(foo()).toBe(undefined);
    });
    it('strips empty object type annotations with initializer', () => {
      var code = transform(['var myObj:{} = {YEP: true};']);
      eval(code);
      expect(myObj.YEP).toBe(true);
    });
    it('strips empty nullable object type annotations with initializer', () => {
      var code = transform(['var myObj:?{} = {YEP: true};']);
      eval(code);
      expect(myObj.YEP).toBe(true);
    });
    it('strips object type with basic property annotation', () => {
      var code = transform(['var myObj:{arrProp:Array} = {YEP: [true]};']);
      eval(code);
      expect(myObj.YEP).toEqual([true]);
    });
    it('strips object type with multiple property annotations', () => {
      var code = transform(['var myObj:{numProp: number; strProp: string} = {', '  numProp: 42,', '  strProp: "YEP"', '};']);
      eval(code);
      expect(myObj.numProp).toBe(42);
      expect(myObj.strProp).toBe("YEP");
    });
    it('strips object type with parametric property annotation', () => {
      var code = transform(['var myObj:{arrProp:Array<bool>} = {YEP: [true]};']);
      eval(code);
      expect(myObj.YEP).toEqual([true]);
    });
    it('strips object type with function property annotation', () => {
      var code = transform(['var myObj:{myMethod:() => void} = {', '  myMethod: function() {', '    return 42;', '  }', '};']);
      eval(code);
      expect(myObj.myMethod()).toBe(42);
    });
  });
});
