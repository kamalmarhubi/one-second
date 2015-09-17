#!/usr/bin/env python

import tempfile
import os

LENGTH = 1000000
s = "a" * LENGTH

def cleanup(f, name):
    f.flush()
    os.fsync(f.fileno())
    f.close()
    try:
        pass
        #os.remove(name)
    except:
        pass

def f(n):
    name = './out'
    f = open(name, 'w')
    bytes_written = 0
    while bytes_written < n:
        f.write(s)
        bytes_written += LENGTH
    cleanup(f, name)

import sys
f(int(sys.argv[1]))
