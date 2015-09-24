#!/usr/bin/env python

# Number to guess: How large of a prime can we find, 
# using a naive algorithm, in a second?

import sys
import itertools
import math

def primes_sieve2(limit):
    a = [True] * limit                          # Initialize the primality list
    a[0] = a[1] = False

    for (i, isprime) in enumerate(a):
        if i * i > limit:
            continue
        if isprime:
            for n in xrange(i*i, limit, i):     # Mark factors non-prime
                a[n] = False
    return a

def f(NUMBER):
    sieve = primes_sieve2(NUMBER)
    for i in xrange(NUMBER-1, 0, -1):
        if sieve[i]:
            sys.stdout.write("%d " % i)
            return

f(int(sys.argv[1]))
