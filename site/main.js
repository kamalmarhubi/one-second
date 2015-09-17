import $ from 'jquery'

var english = function(iters) {
    var bil = Math.pow(10, 9)
    var mil = Math.pow(10, 6)
    var thousand = 1000
    if (iters >= bil) {
        return Math.round(iters / bil) + " billion"
    } else if (iters >= mil) {
        return Math.round(iters / mil) + " million"
    } else if (iters >= thousand) {
        return Math.round(iters / thousand) + " thousand"
    } else {
        return iters
    }
}
var display = function(benchmarks) {
    console.log("hi")
    var i;
    for (i = 0; i < benchmarks.length; i++) {
        var benchmark = benchmarks[i]
        var code = benchmark["code"]
        var source = benchmark["source"]
        var iters = benchmark["rounded_iters"]
        var exact_iters = benchmark["exact_iters"]
        iters = english(iters)

        var thing = "<div class = 'col-md-6'>" + "<h3>" + source + "</h3>" + "iters: " + iters +  ", exact iters:" + english(exact_iters) + "<pre>" + code + "</pre>" + "</div>"
        $("#code").append(thing)
    }
}

$.getJSON("/benchmarks.json", function(result) {
    var json = result
    console.log(result); // this will show the info it in firebug console
    display(result)
});
