#!/usr/bin/env python

import math
import subprocess
import sys
import timeit


def run_prog(prog, iters):
    subprocess.check_call([prog, str(iters)])
     
def main():
    t = 0
    iters = 1
    num_runs = 0
    prog = sys.argv[1]

    while t < 1:
        num_runs += 1
        iters *= 1.1
        iters = int(math.ceil(iters))
        t = timeit.timeit(
                'run_prog("%s", %d)' % (prog, iters,),
                setup='from num_iters import run_prog',
                number=1)

    print num_runs, iters, t

if __name__ == '__main__':
    main()
