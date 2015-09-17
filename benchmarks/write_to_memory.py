#!/usr/bin/env python

import numpy


def f(n):
    arr = numpy.zeros(n)
    arr.fill(23)

import sys
f(int(sys.argv[1]))
