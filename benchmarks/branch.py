#!/usr/bin/env python

# Number to guess: How many times per second can we
# sort an already sorted array with 500 elements?
# (small amount of branch mispredictions)

def f(NUMBER):
    l = range(500)
    for _ in xrange(NUMBER):
        sorted(l)

if __name__ == '__main__':
    import sys
    f(int(sys.argv[1]))
