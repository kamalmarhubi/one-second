#!/usr/bin/env python

# Number to guess: How many passwords
# can we bcrypt in a second?

import bcrypt

password = 'a' * 100

def f(NUMBER):
    for _ in xrange(NUMBER):
        bcrypt.hashpw(password, bcrypt.gensalt())
        
import sys
f(int(sys.argv[1]))
