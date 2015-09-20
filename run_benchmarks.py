#!/usr/bin/env python

import glob
import json
import math
import signal
import subprocess
import sys
import timeit

OUTPUT_FILE = 'site/benchmarks.json'

# Python ignores SIGPIPE by default. This is Very Bad for subprocesses that use pipes
signal.signal(signal.SIGPIPE, signal.SIG_DFL)


def round_nearest_magnitude(x):
    log = math.log(x) / math.log(10)
    return int(10 ** round(log))


def run_prog(prog, iters):
    subprocess.check_call([prog, str(iters)])
     

def benchmark(prog):
    source, binary = compile(prog)
    t = 0
    iters = 1
    num_runs = 0

    while t < 1:
        iters *= 1.1
        iters = int(math.ceil(iters))
        t = timeit.timeit(
                'run_prog("%s", %d)' % (binary, iters,),
                setup='from run_benchmarks import run_prog',
                number=1)

    rounded_iters = round_nearest_magnitude(iters)
    print "   rounded iterations:", rounded_iters
    print "   exact iterations:  ", iters
    print "   final time taken:  ", t
    results = {
        'rounded_iters': rounded_iters,
        'exact_iters': iters,
    }
    with open(source) as f:
        results['code'] = f.read()
    source_filename = source[11:] # remove benchmarks/
    return {source_filename: results}


def compile(source):
    if source.endswith(".c"):
        binary = source.replace(".c", "")
        subprocess.check_call(["gcc", "-O2", "-o", binary, source])
    else:
        binary = source
    return source, binary


def run_benchmarks(benchmarks):
    for source in benchmarks:
        print "----> " + source
        yield benchmark(source)

def find_all_benchmarks():
    return glob.glob("benchmarks/*.*")

def write_json(results):
    j = json.dumps(results, sort_keys=True,
      indent=4, separators=(',', ': '))
    with open(OUTPUT_FILE, 'w') as f:
        f.write(j)

def read_json():
    with open(OUTPUT_FILE) as f:
        return json.load(f)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        all_benchmarks = read_json()
        result = benchmark(sys.argv[1])
        all_benchmarks.update(result)
        write_json(all_benchmarks)
        sys.exit(0)
    else:
        all_benchmarks = find_all_benchmarks()
        results = {}
        for result in run_benchmarks(all_benchmarks):
            results.update(result)
        write_json(results)
