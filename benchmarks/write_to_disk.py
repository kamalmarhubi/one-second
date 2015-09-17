#!/usr/bin/env python

import tempfile
import os

s = "a" * 1000000

def cleanup(temp):
    temp.flush()
    os.fsync(temp.fileno())
    temp.close()
    try:
        os.remove(temp.name)
    except:
        pass

def f(n):
    temp = tempfile.NamedTemporaryFile()
    for i in xrange(n):
        temp.write(s)
    cleanup(temp)

import sys
f(int(sys.argv[1]))
