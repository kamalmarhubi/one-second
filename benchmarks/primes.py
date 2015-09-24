#!/usr/bin/env python

# Number to guess: How large of a prime can we find, 
# using a naive algorithm, in a second?

import sys

def divides(primes, number):
    for p in primes:
        if number % p == 0:
            return True
        if number < p * p:
            return False
    return False

def f(NUMBER):
    primes = [2]
    current = 2
    while current < NUMBER:
        current += 1
        if not divides(primes, current):
            primes.append(current)
    sys.stdout.write("%d " % primes[-1])

f(int(sys.argv[1]))
