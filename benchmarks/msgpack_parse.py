#!/usr/bin/env python

# Number to guess: How many times can we parse
# 64K of msgpack data in a second?

import msgpack

with open('./setup/protobuf/message.msgpack') as f:
    message = f.read()

def f(NUMBER):
    for _ in xrange(NUMBER):
        msgpack.unpackb(message)

if __name__ == '__main__':
    import sys
    f(int(sys.argv[1]))
