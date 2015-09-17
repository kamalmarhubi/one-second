#!/usr/bin/env python

import cStringIO

LENGTH = 1000000
s = "a" * LENGTH

def f(n):
    output = cStringIO.StringIO()
    bytes_written = 0
    while bytes_written < n:
        output.write(s)
        bytes_written += LENGTH

import sys
f(int(sys.argv[1]))
