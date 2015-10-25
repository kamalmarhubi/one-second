#!/usr/bin/env python

# Number to guess: How many bytes can we write
# to an output file in a second?
# Note: we make sure everything is sync'd to disk
# before exiting :)
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

if __name__ == '__main__':
    import sys
    f(int(sys.argv[1]))
