#include <stdlib.h>

// Number to guess: How many iterations of
// this loop can we go through in a second?

int main(int argc, char **argv) {
    int NUMBER, i, s;
    NUMBER = atoi(argv[1]);

    for (s = i = 0; i < NUMBER; ++i) {
        s += 1;
    }

    return 0;
}
