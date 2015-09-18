#!/bin/bash

# Number to guess: How many files can `find` list in a second?
# Note: the files will be in the filesystem cache.

find / -name '*' 2> /dev/null | head -n $1 > /dev/null
