import json

#j = json.dumps({'%d' % (i): i for i in xrange(10000)})
j = json.dumps(range(10000))

def f(n):
    for _ in xrange(n):
        json.loads(j)

import sys
f(int(sys.argv[1]))
