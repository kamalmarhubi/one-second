#!/usr/bin/env python

import json

with open('./setup/protobuf/message.json') as f:
    message = f.read()

def f(NUMBER):
    for _ in xrange(NUMBER):
        json.loads(message)

import sys
f(int(sys.argv[1]))
