#!/usr/bin/env python

import msgpack

with open('./setup/protobuf/message.msgpack') as f:
    message = f.read()

def f(NUMBER):
    for _ in xrange(NUMBER):
        msgpack.unpackb(message)

import sys
f(int(sys.argv[1]))
