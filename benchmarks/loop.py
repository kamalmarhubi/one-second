#!/usr/bin/env python

# Number to guess: How many iterations of an empty loop can we go through in a second?

def f(NUMBER):
    for _ in xrange(NUMBER):
        pass

import sys
f(int(sys.argv[1]))
