import $ from 'jquery'

var curriculum = [
    {
        'text': 'Welcome to the first program! This one is just to get you on your feet: how many loops can you go through in a second? (it might be more than you think!)',
        'programs': ["sum.c", "loop.py"],
    },
    {
        'programs': ["download_webpage.py"],
    },
    {
        'programs': ["make_one_elt_list.py", "run_python.sh"],
    },
    {
        'programs': ["write_to_disk.py", "write_to_memory.py"]
    }
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

var disp = function(benchmarks, name) {
    var benchmark_results = benchmarks[name]
    var code = benchmark_results["code"]
    var iters = benchmark_results["rounded_iters"]
    var exact_iters = benchmark_results["exact_iters"]
    iters = english(iters)

    return "<div class = 'col-md-6'>" + "<h3>" + name + "</h3>" + "iters: " + iters +  ", exact iters:" + english(exact_iters) + "<pre>" + code + "</pre>" + "</div>"
}
var display = function(benchmarks) {
    var i;
    for (i = 0; i < curriculum.length; i++) {
        var programs = curriculum[i]['programs']
        var j;
        $("#code").append("<div class='row'>")
        $("#code").append("<p>" + curriculum[i]['text'] + "</p>")
        for (j = 0; j < programs.length; j++) {
            name = programs[j]
            $("#code").append(disp(benchmarks, name))
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
