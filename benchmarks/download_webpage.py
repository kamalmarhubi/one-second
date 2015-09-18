#!/usr/bin/env python

# Number to guess: How many times can we
# download google.com in a second?

from urllib2 import urlopen


def f(NUMBER):
    for _ in xrange(NUMBER):
        r = urlopen("http://google.com")
        r.read()

import sys
f(int(sys.argv[1]))
