#include <stdlib.h>

int main(int argc, char **argv) {
    int NUMBER, i;
    NUMBER = atoi(argv[1]);

    char* array = malloc(NUMBER);
    for (i = 0; i < NUMBER; ++i) {
        array[i] = 5;
    }

    return 0;
}
