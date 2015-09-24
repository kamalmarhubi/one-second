#!/usr/bin/env python

def f(NUMBER):
    s = 0
    for i in xrange(NUMBER):
        s += 1

if __name__ == '__main__':
    import sys
    f(int(sys.argv[1]))
