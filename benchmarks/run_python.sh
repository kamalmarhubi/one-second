#!/bin/bash

# Number to guess: How many times can we start the Python interpreter in a second?

NUMBER=$1

for i in $(seq $NUMBER); do
    python -c '';
done
