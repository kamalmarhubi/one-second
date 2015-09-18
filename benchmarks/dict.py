#!/usr/bin/env python

# Number to guess: How many entries can
# we add to a dictionary in a second?

CHUNK_SIZE = 10000
strings = [str(i) for i in xrange(CHUNK_SIZE)]

def f(NUMBER):
    for i in xrange(NUMBER / CHUNK_SIZE):
        d = {}
        for s in strings:
            d[s] = s

import sys
f(int(sys.argv[1]))
