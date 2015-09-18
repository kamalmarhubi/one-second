#!/usr/bin/env python

# Number to guess: How many entries can
# we add to a dictionary in a second?

def f(NUMBER):
    d = {}
    for i in xrange(NUMBER):
        d[str(i)] = i

import sys
f(int(sys.argv[1]))
