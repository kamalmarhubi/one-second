#!/usr/bin/env python

import json

#j = json.dumps({'%d' % (i): i for i in xrange(10000)})
j = json.dumps(range(10000))

def f(NUMBER):
    for _ in xrange(NUMBER):
        json.loads(j)

import sys
f(int(sys.argv[1]))
