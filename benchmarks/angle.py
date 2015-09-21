#!/usr/bin/env python

# Number to guess: We generate two random unit vectors in 
# N dimensions and calculate their dot product. How big
# can we make N in a second?

import math
import random

def f(NUMBER):
    arr1 = []
    arr2 = []
    sum1 = 0
    sum2 = 0
    for i in xrange(NUMBER):
        rand1 = random.randint(-10000, 10000)
        rand2 = random.randint(-10000, 10000)
        arr1.append(rand1)
        sum1 += rand1 * rand1
        sum2 += rand2 * rand2
        arr2.append(rand2)
    norm1 = math.sqrt(sum1)
    norm2 = math.sqrt(sum2)
    dot_product = 0
    for i in xrange(NUMBER):
        # We normalize the vectors to unit vectors here
        dot_product += arr1[i] * 1.0 / norm1 * arr2[i] * 1.0 / norm2
    print dot_product,

import sys
f(int(sys.argv[1]))
