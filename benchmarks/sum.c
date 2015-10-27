#include <stdlib.h>

// Number to guess: How many iterations of
// this loop can we go through in a second?

int main(int argc, char **argv) {
    volatile int i = 0;
    volatile int s = 0;
    const unsigned int NUMBER = atoi(argv[1]);

    for (s = i; i < NUMBER; ++i) {
        s += 1;
    }

    return 0;
}
