#include <stdlib.h>
#include <stdio.h>

// Number to guess: How big of an array (in bytes)
// can we allocate and fill in a second?

// this is intentionally more complicated than it needs to be
// so that it matches the out-of-order version :)

int main(int argc, char **argv) {
    int NUMBER, i;
    NUMBER = atoi(argv[1]);

    char* array = malloc(NUMBER);
    int j = 1;
    for (i = 0; i < NUMBER; ++i) {
        j = j * 2;
        if (j > NUMBER) {
            j = j - NUMBER;
        }
        array[i] = j;
    }

    printf("%d", array[NUMBER / 7]); // so that -O2 doesn't optimize out the array

    return 0;
}
