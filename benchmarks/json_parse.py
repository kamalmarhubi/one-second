#!/usr/bin/env python

# Number to guess: How many times can we parse
# 64K of JSON in a second?

import json

with open('./setup/protobuf/message.json') as f:
    message = f.read()

def f(NUMBER):
    for _ in xrange(NUMBER):
        json.loads(message)

if __name__ == '__main__':
    import sys
    f(int(sys.argv[1]))
