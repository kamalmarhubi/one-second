/* */ 
(function(process) {
  var runTests;
  function getContext(esprima, reportCase, reportFailure) {
    'use strict';
    var Reflect,
        Pattern;
    Reflect = {parse: function(code) {
        var result;
        reportCase(code);
        try {
          result = esprima.parse(code);
        } catch (error) {
          result = error;
        }
        return result;
      }};
    Pattern = function(obj) {
      var pattern;
      pattern = JSON.parse(JSON.stringify(obj));
      if (obj.type && obj.type === 'Literal') {
        if (obj.value instanceof RegExp) {
          pattern = {
            type: obj.type,
            value: obj.value.toString()
          };
        }
      }
      if (obj.type && obj.type === 'IfStatement') {
        pattern = {
          type: pattern.type,
          test: pattern.test,
          consequent: pattern.consequent,
          alternate: pattern.alternate
        };
      }
      if (obj.type && obj.type === 'DoWhileStatement') {
        pattern = {
          type: pattern.type,
          body: pattern.body,
          test: pattern.test
        };
      }
      function adjustRegexLiteralAndRaw(key, value) {
        if (key === 'value' && value instanceof RegExp) {
          value = value.toString();
        } else if (key === 'raw' && typeof value === "string") {
          return undefined;
        } else if (key === 'regex' && typeof value === "object") {
          return undefined;
        }
        return value;
      }
      if (obj.type && (obj.type === 'Program')) {
        pattern.assert = function(tree) {
          var actual,
              expected;
          actual = JSON.stringify(tree, adjustRegexLiteralAndRaw, 4);
          expected = JSON.stringify(obj, null, 4);
          if (expected !== actual) {
            reportFailure(expected, actual);
          }
        };
      }
      return pattern;
    };
    return {
      Reflect: Reflect,
      Pattern: Pattern
    };
  }
  if (typeof window !== 'undefined') {
    runTests = function() {
      'use strict';
      var total = 0,
          failures = 0;
      function setText(el, str) {
        if (typeof el.innerText === 'string') {
          el.innerText = str;
        } else {
          el.textContent = str;
        }
      }
      function reportCase(code) {
        var report,
            e;
        report = document.getElementById('report');
        e = document.createElement('pre');
        e.setAttribute('class', 'code');
        setText(e, code);
        report.appendChild(e);
        total += 1;
      }
      function reportFailure(expected, actual) {
        var report,
            e;
        failures += 1;
        report = document.getElementById('report');
        e = document.createElement('p');
        setText(e, 'Expected');
        report.appendChild(e);
        e = document.createElement('pre');
        e.setAttribute('class', 'expected');
        setText(e, expected);
        report.appendChild(e);
        e = document.createElement('p');
        setText(e, 'Actual');
        report.appendChild(e);
        e = document.createElement('pre');
        e.setAttribute('class', 'actual');
        setText(e, actual);
        report.appendChild(e);
      }
      setText(document.getElementById('version'), esprima.version);
      window.setTimeout(function() {
        var tick,
            context = getContext(esprima, reportCase, reportFailure);
        tick = new Date();
        testReflect(context.Reflect, context.Pattern);
        tick = (new Date()) - tick;
        if (failures > 0) {
          document.getElementById('status').className = 'alert-box alert';
          setText(document.getElementById('status'), total + ' tests. ' + 'Failures: ' + failures + '. ' + tick + ' ms');
        } else {
          document.getElementById('status').className = 'alert-box success';
          setText(document.getElementById('status'), total + ' tests. ' + 'No failure. ' + tick + ' ms');
        }
      }, 11);
    };
  } else {
    (function(global) {
      'use strict';
      var esprima = require("../esprima"),
          tick,
          total = 0,
          failures = [],
          header,
          current,
          context;
      function reportCase(code) {
        total += 1;
        current = code;
      }
      function reportFailure(expected, actual) {
        failures.push({
          source: current,
          expected: expected.toString(),
          actual: actual.toString()
        });
      }
      context = getContext(esprima, reportCase, reportFailure);
      tick = new Date();
      require("./reflect").testReflect(context.Reflect, context.Pattern);
      tick = (new Date()) - tick;
      header = total + ' tests. ' + failures.length + ' failures. ' + tick + ' ms';
      if (failures.length) {
        console.error(header);
        failures.forEach(function(failure) {
          console.error(failure.source + ': Expected\n    ' + failure.expected.split('\n').join('\n    ') + '\nto match\n    ' + failure.actual);
        });
      } else {
        console.log(header);
      }
      process.exit(failures.length === 0 ? 0 : 1);
    }(this));
  }
})(require("process"));
