import math
import subprocess
import timeit


def run_prog(iters):
    subprocess.check_call(["./sum", str(iters)])
     
def main():
    t = 0
    iters = 1

    while t < 1:
        iters *= 1.1
        iters = int(math.ceil(iters))
        t = timeit.timeit('run_prog(%d)' % (iters,), setup='from num_iters import run_prog', number=1)

    print iters, t

if __name__ == '__main__':
    main()
