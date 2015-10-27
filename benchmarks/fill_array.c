#include <stdlib.h>

// Number to guess: How big of an array (in bytes)
// can we allocate and fill in a second?

// this is intentionally more complicated than it needs to be
// so that it matches the out-of-order version :)

int main(int argc, char **argv) {
    volatile int i = 0;
    const unsigned int NUMBER = atoi(argv[1]);

    char* array = malloc(NUMBER);
    int j = 1;
    for (i; i < NUMBER; ++i) {
        j = j * 2;
        if (j > NUMBER) {
            j = j - NUMBER;
        }
        array[i] = j;
    }

    return 0;
}
