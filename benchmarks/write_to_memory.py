#!/usr/bin/env python

import cStringIO

CHUNK_SIZE = 1000000
s = "a" * CHUNK_SIZE

def f(NUMBER):
    output = cStringIO.StringIO()
    bytes_written = 0
    while bytes_written < NUMBER:
        output.write(s)
        bytes_written += CHUNK_SIZE

import sys
f(int(sys.argv[1]))
