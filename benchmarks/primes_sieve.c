#include <math.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>
#include <string.h>

// Number to guess: How large of a prime can we find, 
// using a naive algorithm, in a second?

char* primes_sieve(int limit) {
    char* a = malloc(sizeof(char) * limit);
    double sqrt_limit =  sqrt(limit);
    memset(a, 1, limit);
    a[0] = a[1] = 0;
    for (long i = 0; i < sqrt_limit; ++i) {
        char is_prime = a[i];
        if (is_prime > 0) {
            for (long j = i * i; j < limit; j += i) {
                a[j] = 0;
            }
        }
    }
    return a;
}

int main(int argc, char **argv) {
    int NUMBER, i;
    NUMBER = atoi(argv[1]);
    char* sieve = primes_sieve(NUMBER);
    // print the  biggest prime we found
    for (int i = NUMBER - 1; i > 0; i--) {
        if (sieve[i] > 0) {
            printf("%d ", i);
            break;
        }
    }
    return 0;
}
