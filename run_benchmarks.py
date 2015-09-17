#!/usr/bin/env python

import glob
import json
import math
import subprocess
import sys
import timeit


def round_nearest_magnitude(x):
    log = math.log(x) / math.log(10)
    return int(10 ** round(log))


def run_prog(prog, iters):
    subprocess.check_call([prog, str(iters)])
     

def benchmark(prog):
    t = 0
    iters = 1
    num_runs = 0

    while t < 1:
        num_runs += 1
        iters *= 1.1
        iters = int(math.ceil(iters))
        t = timeit.timeit(
                'run_prog("%s", %d)' % (prog, iters,),
                setup='from num_iters import run_prog',
                number=1)

    print num_runs, iters, t, round_nearest_magnitude(iters)
    return {
        'rounded_iters': round_nearest_magnitude(iters),
        'exact_iters': iters,
    }


def compile(source):
    if source.endswith(".c"):
        binary = source.replace(".c", "")
        subprocess.check_call(["gcc", "-o", binary, source])
    else:
        binary = source
    return source, binary


def run_benchmarks(benchmarks):
    for source, binary in benchmarks:
        print "----> " + source
        results = benchmark(binary)
        results = add_source(results, source)
        yield results

def add_source(results, source_file):
    with open(source_file) as f:
        code = f.read()
    results['source'] = source_file[11:]
    results['code'] = code
    return results


def find_all_benchmarks():
    progs = glob.glob("benchmarks/*.*")
    for prog in progs:
        yield compile(prog)


if __name__ == '__main__':
    output_file = 'benchmarks.json'
    if len(sys.argv) > 1:
        benchmark(sys.argv[1])
        sys.exit(0)
    else:
        all_benchmarks = find_all_benchmarks()
        benchmarks_json = json.dumps(list(run_benchmarks(all_benchmarks)))
        with open(output_file, 'w') as f:
            f.write(benchmarks_json)
