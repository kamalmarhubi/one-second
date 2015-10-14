/* */ 
(function(process) {
  (function() {
    'use strict';
    var child = require("child_process"),
        nodejs = '"' + process.execPath + '"',
        ret = 0,
        suites,
        index;
    suites = ['runner', 'compat'];
    function nextTest() {
      var suite = suites[index];
      if (index < suites.length) {
        child.exec(nodejs + ' ./test/' + suite + '.js', function(err, stdout, stderr) {
          if (stdout) {
            process.stdout.write(suite + ': ' + stdout);
          }
          if (stderr) {
            process.stderr.write(suite + ': ' + stderr);
          }
          if (err) {
            ret = err.code;
          }
          index += 1;
          nextTest();
        });
      } else {
        process.exit(ret);
      }
    }
    index = 0;
    nextTest();
  }());
})(require("process"));
