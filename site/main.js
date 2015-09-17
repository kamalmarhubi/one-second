import $ from 'jquery'

var curriculum = [
    ["sum.c", "loop.py"],
    ["make_one_elt_list.py", "run_python.sh"],
    ["write_to_disk.py", "write_to_memory.py"]
]

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

var disp = function(name, benchmark_results) {
    var code = benchmark_results["code"]
    var iters = benchmark_results["rounded_iters"]
    var exact_iters = benchmark_results["exact_iters"]
    iters = english(iters)

    return "<div class = 'col-md-6'>" + "<h3>" + name + "</h3>" + "iters: " + iters +  ", exact iters:" + english(exact_iters) + "<pre>" + code + "</pre>" + "</div>"
}
var display = function(benchmarks) {
    var i;
    for (i = 0; i < curriculum.length; i++) {
        var section = curriculum[i]
        var j;
        $("#code").append("<div class='row'>")
        for (j = 0; j < section.length; j++) {
            name = section[j]
            var benchmark_results = benchmarks[name]
            $("#code").append(disp(name, benchmark_results))
        }
        $("#code").append("</div>")
        $("#code").append("<hr>")
    }
}
$.getJSON("/benchmarks.json", function(result) {
    var json = result
    console.log(result); // this will show the info it in firebug console
    display(result)
});
