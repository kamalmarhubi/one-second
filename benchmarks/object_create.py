#!/usr/bin/env python

import json

#j = json.dumps({'%d' % (i): i for i in xrange(10000)})
j = json.dumps(range(10000))

class MyObject(object):
    def __init__(self):
        self.a  = 'a'
        self.b  = 'b'
        self.c  = 'a'
        self.d  = 'b'
        self.e  = 'a'
        self.f  = 'b'
        self.g  = 'a'
        self.h  = 'b'
        self.i  = 'a'
        self.j  = 'b'
        self.k  = 'a'
        self.l  = 'b'
        self.m  = 'a'
        self.n  = 'b'
        self.o  = 'a'
        self.p  = 'b'
        self.q  = 'a'
        self.r  = 'b'
        self.s  = 'a'
        self.t  = 'b'
        self.u  = 'a'
        self.v  = 'b'
        self.w  = 'b'
        self.x  = 'b'
        self.y  = 'b'
        self.z  = 'b'


def f(NUMBER):
    for _ in xrange(NUMBER):
        MyObject()

if __name__ == '__main__':
    import sys
    f(int(sys.argv[1]))
