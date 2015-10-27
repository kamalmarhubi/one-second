#include <stdlib.h>

// Number to guess: How big of an array (in bytes)
// can we allocate and fill with 5s in a second?
// The catch: We do it out of order instead of in order.
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
        array[j] = j;
    }

    return 0;
}
