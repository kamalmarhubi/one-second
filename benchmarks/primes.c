#include <math.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>

// Number to guess: How large of a prime can we find, 
// using a naive algorithm, in a second?

bool divides(int* primes, int size, int number) {
    for (int i = 0; i < size; i++) {
        int p = primes[i];
        if (number % p == 0) {
            return true;
        }
        if (number < p * p) {
            return false;
        }
    }
    return false;
}

int main(int argc, char **argv) {
    int NUMBER, i;
    NUMBER = atoi(argv[1]);
    int* primes = malloc(NUMBER * sizeof(int));
    int size = 1;
    primes[0] = 2;
    for (int current = 2; current < NUMBER; current++) {
        if (!divides(primes, size, current)) {
            primes[size] = current;
            size++;
        }
    }
    printf("%d ", primes[size - 1]);
}
