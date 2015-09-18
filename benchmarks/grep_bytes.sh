#!/bin/bash 

# Number to guess: How many bytes can `grep`
# search, unsuccessfully, in a second?
# Note: the bytes are in memory


NUMBER=$1

cat /dev/zero | head -c $NUMBER | grep blah | head
