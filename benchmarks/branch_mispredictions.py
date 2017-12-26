#!/usr/bin/env python

import random

# Number to guess: How many times per second can we
# sort a randomly sorted array with 500 elements?
# (large amount of branch mispredictions)

def f(NUMBER):
    l = random.sample(xrange(500), 500)
    for _ in xrange(NUMBER):
        sorted(l)

if __name__ == '__main__':
    import sys
    f(int(sys.argv[1]))
