#!/usr/bin/env python

import tempfile
import os

CHUNK_SIZE = 1000000
s = "a" * CHUNK_SIZE

def cleanup(f, name):
    f.flush()
    os.fsync(f.fileno())
    f.close()
    try:
        os.remove(name)
    except:
        pass

def f(NUMBER):
    name = './out'
    f = open(name, 'w')
    bytes_written = 0
    while bytes_written < NUMBER:
        f.write(s)
        bytes_written += CHUNK_SIZE
    cleanup(f, name)

import sys
f(int(sys.argv[1]))
